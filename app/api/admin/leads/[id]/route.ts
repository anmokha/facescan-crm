import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAdminToken, hasPermission } from '@/lib/auth/verifyAdmin';
import { Permission } from '@/lib/auth/permissions';
import { AuditLogger } from '@/lib/audit/logger';
import { AuditAction } from '@/lib/audit/schema';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * GET /api/admin/leads/[id]
 * Get detailed information for a single lead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdminToken(request);

    if (!hasPermission(adminUser, Permission.LEADS_READ_ALL)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const leadDoc = await adminDb.collection('leads').doc(params.id).get();

    if (!leadDoc.exists) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const data = leadDoc.data()!;

    // Get clinic name
    const clinicDoc = await adminDb.collection('clinics').doc(data.clinicId).get();
    const clinicName = clinicDoc.exists ? clinicDoc.data()?.name : 'Unknown';

    return NextResponse.json({
      id: leadDoc.id,
      ...data,
      clinicName,
      createdAt: data.createdAt?.toDate().toISOString(),
      updatedAt: data.updatedAt?.toDate().toISOString(),
    });

  } catch (error: any) {
    console.error('GET /api/admin/leads/[id] error:', error);

    if (error.message.includes('Missing Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/leads/[id]
 * Update lead status and optionally revenue
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdminToken(request);

    if (!hasPermission(adminUser, Permission.LEADS_UPDATE)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, revenue } = body;

    if (!status && revenue === undefined) {
      return NextResponse.json(
        { error: 'At least one of status or revenue must be provided' },
        { status: 400 }
      );
    }

    const leadRef = adminDb.collection('leads').doc(params.id);
    const leadDoc = await leadRef.get();

    if (!leadDoc.exists) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const updates: any = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status) {
      updates.status = status;

      // If marking as converted, record conversion timestamp
      if (status === 'converted' && leadDoc.data()!.status !== 'converted') {
        updates.convertedAt = FieldValue.serverTimestamp();
      }
    }

    if (revenue !== undefined) {
      updates.revenue = revenue;
    }

    await leadRef.update(updates);

    // Audit log
    await AuditLogger.logSuccess(
      AuditAction.UPDATE_LEAD,
      request,
      adminUser,
      params.id,
      leadDoc.data()!.clinicId,
      { status, revenue }
    );

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully'
    });

  } catch (error: any) {
    console.error('PATCH /api/admin/leads/[id] error:', error);

    if (error.message.includes('Missing Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/leads/[id]
 * Delete a lead (soft delete by default)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdminToken(request);

    if (!hasPermission(adminUser, Permission.LEADS_DELETE)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    const leadRef = adminDb.collection('leads').doc(params.id);
    const leadDoc = await leadRef.get();

    if (!leadDoc.exists) {
      return NextResponse.json(
        { error: 'Lead not found' },
        { status: 404 }
      );
    }

    const leadData = leadDoc.data()!;

    // Check if hard delete is requested
    const { searchParams } = new URL(request.url);
    const hardDelete = searchParams.get('hard') === 'true';

    if (hardDelete) {
      // Permanently delete
      await leadRef.delete();

      await AuditLogger.logSuccess(
        AuditAction.DELETE_LEAD,
        request,
        adminUser,
        params.id,
        leadData.clinicId,
        { hardDelete: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Lead permanently deleted'
      });
    } else {
      // Soft delete (mark as deleted)
      await leadRef.update({
        status: 'deleted',
        deletedAt: FieldValue.serverTimestamp(),
        deletedBy: adminUser.uid,
        updatedAt: FieldValue.serverTimestamp(),
      });

      await AuditLogger.logSuccess(
        AuditAction.DELETE_LEAD,
        request,
        adminUser,
        params.id,
        leadData.clinicId,
        { softDelete: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Lead marked as deleted'
      });
    }

  } catch (error: any) {
    console.error('DELETE /api/admin/leads/[id] error:', error);

    if (error.message.includes('Missing Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
