export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, hasPermission } from '@/lib/auth/verifyAdmin';
import { getAllAdminUsers } from '@/lib/auth/adminRoles';
import { Permission } from '@/lib/auth/permissions';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify caller is admin
    const adminUser = await verifyAdminToken(request);

    // 2. Check permission (Super admins and admins can view user list)
    if (!hasPermission(adminUser, Permission.USERS_READ)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // 3. Get all admin users
    const users = await getAllAdminUsers();

    // 4. Return user list
    return NextResponse.json({
      users: users,
      total: users.length,
    });

  } catch (error: any) {
    console.error('List users error:', error);

    if (error.message.includes('Missing Authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch admin users' },
      { status: 500 }
    );
  }
}
