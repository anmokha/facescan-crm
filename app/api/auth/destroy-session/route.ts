import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Destroy admin session cookie (logout)
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    let userId: string | undefined;

    // Try to get user info from session before destroying
    if (sessionCookie) {
      try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        userId = decodedClaims.uid;

        // Audit log
        await adminDb.collection('admin_audit').add({
          action: 'ADMIN_LOGOUT',
          actorUid: decodedClaims.uid,
          actorEmail: decodedClaims.email,
          actorRole: decodedClaims.role,
          timestamp: FieldValue.serverTimestamp(),
          success: true,
          metadata: {
            userAgent: request.headers.get('user-agent'),
            ip: request.headers.get('x-forwarded-for') ||
                request.headers.get('x-real-ip') ||
                'unknown',
          }
        });
      } catch (error) {
        // Session already invalid, just clear cookie
        console.log('Session already invalid, clearing cookie');
      }
    }

    // Delete the session cookie
    cookieStore.delete('__session');

    // Revoke all refresh tokens for this user (optional, more secure)
    if (userId) {
      try {
        await adminAuth.revokeRefreshTokens(userId);
      } catch (error) {
        console.error('Failed to revoke refresh tokens:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Session destroyed'
    });

  } catch (error: any) {
    console.error('Session destruction error:', error);

    // Still delete the cookie even if audit logging fails
    const cookieStore = cookies();
    cookieStore.delete('__session');

    return NextResponse.json({
      success: true,
      message: 'Session destroyed'
    });
  }
}
