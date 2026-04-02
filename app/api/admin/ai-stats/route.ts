import { NextRequest, NextResponse } from 'next/server';
import { verifySessionCookie } from '@/lib/auth/verifySession';
import { hasPermission, Permission, getRolePermissions } from '@/lib/auth/permissions';
import { getAIStats, PeriodType } from '@/lib/admin/aiStatsService';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify admin session
    const sessionCookie = request.cookies.get('__session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await verifySessionCookie(sessionCookie);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check permission (ADMIN_VIEW_ANALYTICS or higher)
    const userPermissions = getRolePermissions(session.role);
    if (!hasPermission(userPermissions, Permission.ADMIN_VIEW_ANALYTICS)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Parse query params
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get('period') || 'day';
    
    // Validate period
    const validPeriods: PeriodType[] = ['day', 'week', 'month'];
    const period = validPeriods.includes(periodParam as PeriodType) 
      ? (periodParam as PeriodType) 
      : 'day';

    // 4. Fetch stats
    const stats = await getAIStats(period);

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('AI Stats API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI statistics', details: error.message },
      { status: 500 }
    );
  }
}
