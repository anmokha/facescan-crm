import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyAdminToken, requireClinicAccess } from '@/lib/auth/verifyAdmin';
import { AuditLogger } from '@/lib/audit/logger';

/**
 * GET /api/admin/social-content?clinicId=X
 * List all social content for a clinic
 */
export async function GET(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request);
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    if (!clinicId) {
      return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 });
    }

    requireClinicAccess(adminUser, clinicId);

    const snapshot = await adminDb.collection('clinics').doc(clinicId).collection('social_content')
      .orderBy('order', 'asc')
      .get();

    const content = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 500 });
  }
}

/**
 * POST /api/admin/social-content
 * Create a new social content item
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request);
    const body = await request.json();
    const { clinicId, ...contentData } = body;

    if (!clinicId) {
      return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 });
    }

    requireClinicAccess(adminUser, clinicId);

    const docRef = await adminDb.collection('clinics').doc(clinicId).collection('social_content').add({
      ...contentData,
      clinicId,
      createdAt: new Date(),
      isActive: contentData.isActive ?? true,
      order: contentData.order ?? 0
    });

    await AuditLogger.logSuccess(
      'social_content.create' as any,
      request,
      adminUser,
      'clinic',
      clinicId,
      {
        contentId: docRef.id,
        type: contentData.type
      }
    );

    return NextResponse.json({ id: docRef.id });
  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
