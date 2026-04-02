/**
 * Session verification for API routes and Server Components
 * Verifies Firebase session cookies using Firebase Admin SDK
 *
 * ⚠️ IMPORTANT: DO NOT USE IN MIDDLEWARE
 * This file uses Firebase Admin SDK which requires Node.js runtime.
 * Middleware runs in Edge Runtime and cannot use this.
 *
 * For middleware: Just check if __session cookie exists (simple check)
 * For API routes: Use verifySessionCookie() for full verification
 */

import { adminAuth } from '@/lib/firebaseAdmin';
import { Role } from './permissions';

export interface SessionUser {
  uid: string;
  email: string | undefined;
  role: Role;
  admin: boolean;
}

/**
 * Verify session cookie
 * Returns user info if valid, null if invalid
 */
export async function verifySessionCookie(
  sessionCookie: string
): Promise<SessionUser | null> {
  try {
    // Verify session cookie and check if revoked
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Check if user has admin claim
    if (!decodedClaims.admin) {
      return null;
    }

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      role: decodedClaims.role as Role,
      admin: true,
    };

  } catch (error: any) {
    // Session invalid, expired, or revoked
    console.log('Session verification failed:', error.code);
    return null;
  }
}

/**
 * Check if session is valid for admin access
 */
export async function isValidAdminSession(
  sessionCookie: string | undefined
): Promise<boolean> {
  if (!sessionCookie) {
    return false;
  }

  const user = await verifySessionCookie(sessionCookie);
  return user !== null && user.admin === true;
}
