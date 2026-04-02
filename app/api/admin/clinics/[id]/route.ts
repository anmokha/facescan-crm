import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { verifyAdminToken, hasPermission } from '@/lib/auth/verifyAdmin'
import { Permission } from '@/lib/auth/permissions'

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const adminUser = await verifyAdminToken(request);
        const clinicId = params.id;

        if (!hasPermission(adminUser, Permission.CLINICS_UPDATE)) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { checkupLimit, isPilot, name, slug, isActive, trafficWeight, contactChannel, instagramHandle, whatsappNumber } = body;

        const updateData: any = {};
        if (checkupLimit !== undefined) updateData['limits.checkups'] = checkupLimit;
        if (isPilot !== undefined) updateData.isPilot = isPilot;
        if (name !== undefined) updateData.name = name;
        if (slug !== undefined) updateData.slug = slug;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (trafficWeight !== undefined) updateData.trafficWeight = trafficWeight;
        if (contactChannel !== undefined) updateData.contactChannel = contactChannel;
        if (instagramHandle !== undefined) updateData.instagramHandle = instagramHandle;
        if (whatsappNumber !== undefined) updateData.whatsappNumber = whatsappNumber;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No data to update' }, { status: 400 });
        }

        await adminDb.collection('clinics').doc(clinicId).update(updateData);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('PATCH /api/admin/clinics/[id] error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
