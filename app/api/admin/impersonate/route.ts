import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'
import { verifyAdminToken, hasPermission } from '@/lib/auth/verifyAdmin'
import { Permission } from '@/lib/auth/permissions'
import { FieldValue } from 'firebase-admin/firestore'

export async function POST(request: NextRequest) {
  try {
    // 1. Verify caller is admin with proper token
    const adminUser = await verifyAdminToken(request);

    // 2. Check permission to impersonate
    if (!hasPermission(adminUser, Permission.USERS_IMPERSONATE)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to impersonate users' },
        { status: 403 }
      );
    }

    // 3. Parse and validate request
    const { targetUid } = await request.json();

    if (!targetUid) {
      return NextResponse.json(
        { error: 'Missing targetUid' },
        { status: 400 }
      );
    }

    // 4. Verify target user exists
    const targetUser = await adminAuth.getUser(targetUid);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      );
    }

    // 5. Create custom token for impersonation
    const customToken = await adminAuth.createCustomToken(targetUid, {
        isImpersonated: true,
        originalAdminUid: adminUser.uid,
        originalAdminEmail: adminUser.email,
        impersonatedAt: Date.now()
    });

    // 6. Audit log (CRITICAL for compliance)
    await adminDb.collection('admin_audit').add({
      action: 'IMPERSONATE_USER',
      actorUid: adminUser.uid,
      actorEmail: adminUser.email,
      actorRole: adminUser.role,
      resourceType: 'user',
      resourceId: targetUid,
      timestamp: FieldValue.serverTimestamp(),
      success: true,
      metadata: {
        targetEmail: targetUser.email,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown',
        referer: request.headers.get('referer')
      }
    });

    console.log(`✅ ${adminUser.email} impersonating ${targetUser.email}`);

    return NextResponse.json({
      token: customToken,
      targetEmail: targetUser.email
    });

  } catch (error: any) {
    console.error('Impersonation error:', error);

    // Don't leak internal error details
    if (error.message.includes('Missing Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ error: 'Impersonation failed' }, { status: 500 });
  }
}
