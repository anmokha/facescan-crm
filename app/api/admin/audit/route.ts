export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, hasPermission } from '@/lib/auth/verifyAdmin';
import { Permission } from '@/lib/auth/permissions';
import { AuditLogger } from '@/lib/audit/logger';
import { AuditAction } from '@/lib/audit/schema';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify admin token
    const adminUser = await verifyAdminToken(request);

    // 2. Check permission
    if (!hasPermission(adminUser, Permission.ADMIN_VIEW_AUDIT)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to view audit logs' },
        { status: 403 }
      );
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);

    const action = searchParams.get('action') as AuditAction | null;
    const actorEmail = searchParams.get('actorEmail');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const resourceType = searchParams.get('resourceType');
    const resourceId = searchParams.get('resourceId');
    const success = searchParams.get('success');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // 4. Query audit logs
    const logs = await AuditLogger.query({
      action: action || undefined,
      actorEmail: actorEmail || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      resourceType: resourceType || undefined,
      resourceId: resourceId || undefined,
      success: success !== null ? success === 'true' : undefined,
      limit,
      offset,
    });

    // 5. Log this access
    await AuditLogger.logSuccess(
      AuditAction.VIEW_AUDIT_LOG,
      request,
      adminUser,
      undefined,
      undefined,
      { filters: { action, actorEmail, startDate, endDate } }
    );

    return NextResponse.json({
      logs,
      total: logs.length,
      filters: {
        action,
        actorEmail,
        startDate,
        endDate,
        resourceType,
        resourceId,
        success,
      },
    });

  } catch (error: any) {
    console.error('GET /api/admin/audit error:', error);

    if (error.message.includes('Missing Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
