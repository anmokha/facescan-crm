import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { cookies } from 'next/headers';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Create secure session cookie after authentication
 * Called by client after successful Firebase login
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Get ID token from request body
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'Missing idToken' },
        { status: 400 }
      );
    }

    // 2. Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // 3. Check if user has admin claim
    if (!decodedToken.admin) {
      return NextResponse.json(
        { error: 'Not an admin user' },
        { status: 403 }
      );
    }

    // 4. Create session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // 5. Set HTTP-only cookie
    const cookieStore = cookies();
    cookieStore.set('__session', sessionCookie, {
      maxAge: expiresIn / 1000, // maxAge in seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    // 6. Update last login timestamp
    await adminDb.collection('admin_users').doc(decodedToken.uid).set({
      lastLoginAt: FieldValue.serverTimestamp(),
      lastLoginIp: request.headers.get('x-forwarded-for') ||
                   request.headers.get('x-real-ip') ||
                   'unknown',
    }, { merge: true });

    // 7. Audit log
    await adminDb.collection('admin_audit').add({
      action: 'ADMIN_LOGIN',
      actorUid: decodedToken.uid,
      actorEmail: decodedToken.email,
      actorRole: decodedToken.role,
      timestamp: FieldValue.serverTimestamp(),
      success: true,
      metadata: {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown',
      }
    });

    return NextResponse.json({
      success: true,
      expiresIn: expiresIn,
      role: decodedToken.role,
    });

  } catch (error: any) {
    console.error('Session creation error:', error);

    // Audit failed login attempt
    try {
      await adminDb.collection('admin_audit').add({
        action: 'ADMIN_LOGIN_FAILED',
        timestamp: FieldValue.serverTimestamp(),
        success: false,
        errorMessage: error.message,
        metadata: {
          userAgent: request.headers.get('user-agent'),
          ip: request.headers.get('x-forwarded-for') ||
              request.headers.get('x-real-ip') ||
              'unknown',
        }
      });
    } catch (auditError) {
      console.error('Failed to log failed login:', auditError);
    }

    if (error.code === 'auth/id-token-expired') {
      return NextResponse.json(
        { error: 'Token expired' },
        { status: 401 }
      );
    }

    if (error.code === 'auth/argument-error') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 401 }
    );
  }
}
