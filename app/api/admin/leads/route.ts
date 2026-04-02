export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, hasPermission } from '@/lib/auth/verifyAdmin';
import { Permission } from '@/lib/auth/permissions';
import { getAllLeads } from '@/lib/adminService';
import { AuditLogger } from '@/lib/audit/logger';
import { AuditAction } from '@/lib/audit/schema';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify admin token
    const adminUser = await verifyAdminToken(request);

    // 2. Check permission
    if (!hasPermission(adminUser, Permission.LEADS_READ_ALL)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions to view leads' },
        { status: 403 }
      );
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor') || undefined;

    // 4. Fetch leads
    const result = await getAllLeads(clinicId, limit, cursor);

    // 5. Log access (don't log for small limit queries like dashboard widgets)
    if (limit >= 50) {
      await AuditLogger.logSuccess(
        AuditAction.VIEW_LEADS,
        request,
        adminUser,
        undefined,
        undefined,
        { clinicId, limit }
      );
    }

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('GET /api/admin/leads error:', error);

    if (error.message.includes('Missing Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
