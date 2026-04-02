/**
 * Mark Lead as Converted API
 *
 * Endpoint: POST /api/leads/mark-converted
 * Purpose: Mark a lead as converted with revenue tracking
 *
 * Body:
 * {
 *   leadId: string;
 *   revenue: number;       // Actual revenue from this lead
 *   notes?: string;        // Optional conversion notes
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAdminToken, hasAccessToClinic } from '@/lib/auth/verifyAdmin';
import { hasPermission } from '@/lib/auth/permissions';
import { Permission } from '@/lib/auth/permissions';
import { AuditLogger } from '@/lib/audit/logger';
import { AuditAction } from '@/lib/audit/schema';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify admin authentication
    const adminUser = await verifyAdminToken(request);

    // 2. Check permission
    if (!hasPermission(adminUser.permissions, Permission.LEADS_UPDATE)) {
      await AuditLogger.logFromRequest(
        AuditAction.UPDATE_LEAD,
        request,
        adminUser,
        {
          success: false,
          errorMessage: 'Insufficient permissions',
        }
      );

      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const { leadId, revenue, notes } = await request.json();

    if (!leadId || typeof revenue !== 'number' || Number.isNaN(revenue)) {
      return NextResponse.json(
        { error: 'Missing required fields: leadId, revenue' },
        { status: 400 }
      );
    }

    if (revenue < 0) {
      return NextResponse.json(
        { error: 'Revenue must be a positive number' },
        { status: 400 }
      );
    }

    // 4. Get lead document
    const leadRef = adminDb.collection('leads').doc(leadId);
    const leadDoc = await leadRef.get();

    if (!leadDoc.exists) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const leadData = leadDoc.data()!;
    if (!hasAccessToClinic(adminUser, leadData.clinicId)) {
      return NextResponse.json(
        { error: 'Forbidden: No access to clinic' },
        { status: 403 }
      );
    }

    // 5. Update lead status to 'converted'
    const updateData: any = {
      status: 'converted',
      revenue: revenue,
      convertedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (notes) {
      updateData.conversionNotes = notes;
    }

    await leadRef.update(updateData);

    // 6. Log the conversion
    await AuditLogger.logFromRequest(
      AuditAction.UPDATE_LEAD,
      request,
      adminUser,
      {
        resourceType: 'lead',
        resourceId: leadId,
        success: true,
        metadata: {
          action: 'mark_converted',
          clinicId: leadData.clinicId,
          revenue: revenue,
          previousStatus: leadData.status,
          newStatus: 'converted',
        },
      }
    );

    // Note: Clinic counters (totalRevenue, convertedCount) are updated
    // automatically by Cloud Functions (onLeadUpdate trigger)

    return NextResponse.json({
      success: true,
      leadId: leadId,
      revenue: revenue,
      message: 'Lead marked as converted successfully',
    });

  } catch (error: any) {
    console.error('POST /api/leads/mark-converted error:', error);

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
