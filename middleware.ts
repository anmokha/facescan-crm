/**
 * CureScan Multi-Tenant Edge Middleware
 *
 * Responsibilities:
 * 1) protect admin UI routes via session-cookie presence checks,
 * 2) resolve tenant identity from query/subdomain,
 * 3) pass tenant context through `x-client-id`,
 * 4) route tenant home traffic to the checkup application.
 *
 * Notes:
 * - This runs in Edge Runtime, so full Firebase Admin verification
 *   is delegated to server-side API/components.
 * - Middleware performs only lightweight guardrails.
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Auth pages that should not be rewritten (shared by all subdomains)
  const authPages = ['/login', '/signup', '/onboarding', '/logout']
  const isAuthPage = authPages.some(page => url.pathname.startsWith(page))

  // 0. ADMIN ROUTE PROTECTION (Subdomain OR Query param for testing)
  const isAdminQuery = url.searchParams.get('admin') === 'true'
  const isAdminSubdomain = hostname.startsWith('admin.')
  const isAdminPath = url.pathname.startsWith('/admin')

  // Note: /api/admin routes are NOT protected by middleware (they do their own auth check)
  // This is because middleware runs in Edge Runtime which can't use Firebase Admin SDK

  // Admin subdomain handling
  if (isAdminSubdomain) {
     // Allow auth API endpoints to pass without session (needed to create/destroy session)
     if (url.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
     }

     // Allow auth pages
     if (isAuthPage) {
        return NextResponse.next();
     }

     const sessionCookie = request.cookies.get('__session')?.value;

     // If root path on admin domain, normalize to /admin (with login if needed)
     if (url.pathname === '/') {
        if (!sessionCookie) {
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('redirect', '/admin');
          return NextResponse.redirect(loginUrl);
        }
        return NextResponse.redirect(new URL('/admin', request.url));
     }

     // Protect only /admin pages here; do not rewrite other paths
     if (url.pathname.startsWith('/admin')) {
        if (!sessionCookie) {
          const loginUrl = new URL('/login', request.url);
          loginUrl.searchParams.set('redirect', '/admin');
          return NextResponse.redirect(loginUrl);
        }
        
        // Basic JWT format check (header.payload.signature)
        // This prevents naive cookie forgery (e.g. document.cookie="admin=1")
        // FULL verification happens in Server Components via lib/adminService.ts
        const parts = sessionCookie.split('.');
        if (parts.length !== 3) {
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', '/admin');
            return NextResponse.redirect(loginUrl);
        }
     }

     return NextResponse.next();
  }

  // Admin path on any host (e.g., main domain): protect similarly
  if (isAdminPath || isAdminQuery) {
     if (url.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
     }
     if (isAuthPage) {
        return NextResponse.next();
     }
     const sessionCookie = request.cookies.get('__session')?.value;
     if (!sessionCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', '/admin');
        return NextResponse.redirect(loginUrl);
     }
     
     // Basic JWT format check
     const parts = sessionCookie.split('.');
     if (parts.length !== 3) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', '/admin');
        return NextResponse.redirect(loginUrl);
     }

     return NextResponse.next();
  }

  // 1. Identify Client ID
  let clientId = 'default' 

  // Priority 1: Query param override (works on localhost AND vercel previews)
  const queryClient = url.searchParams.get('client')
  if (queryClient) {
    clientId = queryClient
  } 
  // Priority 2: Production Subdomains (e.g. epilux.curescan.pro)
  // We ignore 'vercel.app' to ensure preview URLs show the landing page by default
  else if (!hostname.includes('vercel.app') && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    const subdomain = hostname.split('.')[0]

    // Admin subdomain is handled above at line 16-22
    // Skip 'admin' subdomain here to avoid duplicate logic

    if (subdomain && subdomain !== 'www' && subdomain !== 'curescan' && subdomain !== 'mail' && subdomain !== 'admin' && subdomain !== 'checkup') {
      clientId = subdomain
    }
  }

  // 2. Clone the request headers and add x-client-id
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-client-id', clientId)

  // 3. Logic: If it's a specific client (not default) OR the 'checkup' domain, 
  // and they are on home page, rewrite them to the /checkup app.
  const isCheckupDomain = hostname.startsWith('checkup.');

  if ((clientId !== 'default' || isCheckupDomain) && url.pathname === '/') {
     return NextResponse.rewrite(new URL('/checkup', request.url), {
       request: {
         headers: requestHeaders,
       },
     })
  }

  // 4. Return response with new headers for other cases
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
