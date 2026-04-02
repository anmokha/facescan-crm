/**
 * Analytics API
 *
 * Endpoint: GET /api/admin/analytics
 * Purpose: Provide platform-wide analytics and metrics
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAdminToken, hasPermission } from '@/lib/auth/verifyAdmin';
import { Permission } from '@/lib/auth/permissions';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify admin authentication
    const adminUser = await verifyAdminToken(request);

    // 2. Check permission
    if (!hasPermission(adminUser, Permission.ADMIN_VIEW_ANALYTICS)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // 3. Parse query parameters
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    const rangeMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };
    const daysAgo = rangeMap[range] || 30;
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysAgo);

    // 4. Fetch all leads within range
    const leadsSnap = await adminDb
      .collection('leads')
      .where('createdAt', '>=', startDate)
      .get();

    // 5. Fetch all clinics
    const clinicsSnap = await adminDb.collection('clinics').get();
    const clinicsMap = new Map();
    clinicsSnap.docs.forEach(doc => {
      clinicsMap.set(doc.id, { id: doc.id, name: doc.data().name || 'Unknown' });
    });

    // 6. Process data for analytics
    const monthlyData: Record<string, { revenue: number; leads: number }> = {};
    const clinicData: Record<string, { name: string; leads: number; revenue: number }> = {};
    const statusData: Record<string, number> = {};
    const funnelData = {
      'New Leads': 0,
      'Contacted': 0,
      'Qualified': 0,
      'Converted': 0,
    };

    leadsSnap.docs.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      if (!createdAt) return;

      // Monthly aggregation
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, leads: 0 };
      }
      monthlyData[monthKey].leads++;
      if (data.status === 'converted' && data.revenue) {
        monthlyData[monthKey].revenue += data.revenue;
      }

      // Clinic aggregation
      const clinicId = data.clinicId;
      const clinicName = clinicsMap.get(clinicId)?.name || 'Unknown';
      if (!clinicData[clinicId]) {
        clinicData[clinicId] = { name: clinicName, leads: 0, revenue: 0 };
      }
      clinicData[clinicId].leads++;
      if (data.status === 'converted' && data.revenue) {
        clinicData[clinicId].revenue += data.revenue;
      }

      // Status distribution
      const status = data.status || 'new';
      statusData[status] = (statusData[status] || 0) + 1;

      // Funnel
      funnelData['New Leads']++;
      if (status === 'contacted' || status === 'converted') {
        funnelData['Contacted']++;
      }
      if (status === 'converted') {
        funnelData['Qualified']++;
        funnelData['Converted']++;
      }
    });

    // 7. Format data for charts
    const revenueByMonth = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: formatMonth(month),
        revenue: data.revenue,
      }));

    const leadsByMonth = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: formatMonth(month),
        leads: data.leads,
      }));

    const clinicPerformance = Object.values(clinicData)
      .sort((a, b) => b.leads - a.leads)
      .map(clinic => ({
        name: clinic.name,
        leads: clinic.leads,
        revenue: clinic.revenue,
      }));

    const statusDistribution = Object.entries(statusData).map(([status, count]) => ({
      status: capitalizeStatus(status),
      count,
    }));

    const conversionFunnel = Object.entries(funnelData).map(([stage, count]) => ({
      stage,
      count,
    }));

    return NextResponse.json({
      revenueByMonth,
      leadsByMonth,
      clinicPerformance,
      statusDistribution,
      conversionFunnel,
    });

  } catch (error: any) {
    console.error('GET /api/admin/analytics error:', error);

    if (error.message?.includes('Missing Authorization') ||
        error.message?.includes('not an admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month) - 1]} ${year.slice(2)}`;
}

function capitalizeStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
