import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAdminToken, requireClinicAccess } from '@/lib/auth/verifyAdmin';
import { AuditLogger } from '@/lib/audit/logger';

/**
 * PATCH /api/admin/social-content/[id]?clinicId=X
 * Update a social content item
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdminToken(request);
    const id = params.id;
    const body = await request.json();
    const { clinicId, ...updateData } = body;

    if (!clinicId) {
      return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 });
    }

    requireClinicAccess(adminUser, clinicId);

    const docRef = adminDb.collection('clinics').doc(clinicId).collection('social_content').doc(id);
    const existingDoc = await docRef.get();

    if (!existingDoc.exists) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    await docRef.update(updateData);

    await AuditLogger.logChange(
      'social_content.update' as any,
      request,
      adminUser,
      'clinic',
      clinicId,
      existingDoc.data(),
      { ...existingDoc.data(), ...updateData }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/social-content/[id]?clinicId=X
 * Delete a social content item
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const adminUser = await verifyAdminToken(request);
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    if (!clinicId) {
      return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 });
    }

    requireClinicAccess(adminUser, clinicId);

    const docRef = adminDb.collection('clinics').doc(clinicId).collection('social_content').doc(id);
    const existingDoc = await docRef.get();

    if (!existingDoc.exists) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    await docRef.delete();

    await AuditLogger.logSuccess(
      'social_content.delete' as any,
      request,
      adminUser,
      'clinic',
      clinicId,
      { contentId: id, type: existingDoc.data()?.type }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
