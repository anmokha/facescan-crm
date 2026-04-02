import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, requirePermission } from '@/lib/auth/verifyAdmin';
import { revokeAdminRole } from '@/lib/auth/adminRoles';
import { Permission } from '@/lib/auth/permissions';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify caller is admin
    const adminUser = await verifyAdminToken(request);

    // 2. Check permission to revoke roles
    requirePermission(adminUser, Permission.ADMIN_REVOKE_ROLE);

    // 3. Parse request body
    const body = await request.json();
    const { uid } = body;

    // 4. Validate input
    if (!uid) {
      return NextResponse.json(
        { error: 'UID is required' },
        { status: 400 }
      );
    }

    // 5. Prevent self-revocation
    if (uid === adminUser.uid) {
      return NextResponse.json(
        { error: 'Cannot revoke your own admin role' },
        { status: 400 }
      );
    }

    // 6. Revoke admin role
    await revokeAdminRole(uid, adminUser.uid);

    return NextResponse.json({
      success: true,
      message: 'Admin role revoked successfully',
    });

  } catch (error: any) {
    console.error('Revoke role error:', error);

    if (error.message.includes('Missing required permission')) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    if (error.message.includes('Missing Authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to revoke admin role' },
      { status: 500 }
    );
  }
}
