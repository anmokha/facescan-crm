/**
 * Dashboard Stats API
 *
 * Endpoint: GET /api/admin/dashboard/stats
 * Purpose: Aggregate platform-wide statistics for admin dashboard
 *
 * Uses Phase 2 counters for optimal performance
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAdminToken } from '@/lib/auth/verifyAdmin';

export async function GET(request: NextRequest) {
  try {
    // 1. Verify admin authentication
    const adminUser = await verifyAdminToken(request);

    // 2. Get all clinics (uses counters from Phase 2)
    const clinicsSnap = await adminDb.collection('clinics').get();

    // 3. Aggregate platform stats
    const stats = {
      totalRevenue: 0,
      totalLeads: 0,
      totalClinics: clinicsSnap.size,
      activeClinics: 0,
      totalConversions: 0,
    };

    let maxRevenue = 0;
    let topClinic = null;

    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);

    clinicsSnap.docs.forEach(doc => {
      const data = doc.data();

      // Aggregate revenue and leads from Phase 2 counters
      stats.totalRevenue += data.totalRevenue || 0;
      stats.totalLeads += data.leadCount || 0;
      stats.totalConversions += data.convertedCount || 0;

      // Active = has leads in last 30 days
      const lastLeadTime = data.lastLeadAt?.toMillis();
      if (lastLeadTime && lastLeadTime > thirtyDaysAgo) {
        stats.activeClinics++;
      }

      // Track top performer
      const revenue = data.totalRevenue || 0;
      if (revenue > maxRevenue) {
        maxRevenue = revenue;
        topClinic = {
          id: doc.id,
          name: data.name || 'Unnamed Clinic',
          revenue: revenue
        };
      }
    });

    // 4. Calculate average conversion rate
    const averageConversion = stats.totalLeads > 0
      ? (stats.totalConversions / stats.totalLeads) * 100
      : 0;

    // 5. Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLeadsSnap = await adminDb.collection('leads')
      .where('createdAt', '>=', today)
      .get();

    let revenueToday = 0;
    todayLeadsSnap.docs.forEach(doc => {
      const data = doc.data();
      if (data.status === 'converted' && data.revenue) {
        revenueToday += data.revenue;
      }
    });

    return NextResponse.json({
      totalRevenue: stats.totalRevenue,
      totalLeads: stats.totalLeads,
      totalClinics: stats.totalClinics,
      activeClinics: stats.activeClinics,
      averageConversion: parseFloat(averageConversion.toFixed(1)),
      newLeadsToday: todayLeadsSnap.size,
      revenueToday: revenueToday,
      topPerformingClinic: topClinic
    });

  } catch (error: any) {
    console.error('GET /api/admin/dashboard/stats error:', error);

    // If it's an authentication error, return 401
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
