import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, requirePermission } from '@/lib/auth/verifyAdmin';
import { grantAdminRole } from '@/lib/auth/adminRoles';
import { Permission, Role } from '@/lib/auth/permissions';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify caller is admin
    const adminUser = await verifyAdminToken(request);

    // 2. Check permission to grant roles
    requirePermission(adminUser, Permission.ADMIN_GRANT_ROLE);

    // 3. Parse request body
    const body = await request.json();
    const { email, role, assignedClinics } = body;

    // 4. Validate input
    if (!email || !role) {
      return NextResponse.json(
        { error: 'Email and role are required' },
        { status: 400 }
      );
    }

    // Validate role
    if (!Object.values(Role).includes(role as Role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // 5. Get or create user
    let targetUser;
    try {
      targetUser = await adminAuth.getUserByEmail(email);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        // Create new user
        targetUser = await adminAuth.createUser({
          email,
          emailVerified: false,
          disabled: false,
        });
      } else {
        throw error;
      }
    }

    // 6. Grant admin role
    await grantAdminRole(
      targetUser.uid,
      role as Role,
      adminUser.uid,
      assignedClinics
    );

    // 7. Generate password reset link for new users
    let passwordResetLink;
    try {
      passwordResetLink = await adminAuth.generatePasswordResetLink(email, {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://curescan.pro'}/login`,
      });
    } catch (error) {
      console.error('Failed to generate password reset link:', error);
    }

    return NextResponse.json({
      success: true,
      uid: targetUser.uid,
      email: targetUser.email,
      role: role,
      passwordResetLink: passwordResetLink,
      message: 'Admin role granted successfully',
    });

  } catch (error: any) {
    console.error('Grant role error:', error);

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
      { error: 'Failed to grant admin role' },
      { status: 500 }
    );
  }
}
