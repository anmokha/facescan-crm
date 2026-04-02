/**
 * Conversion Webhook API
 *
 * Purpose:
 * Receive post-sale events from external CRM systems and map them back
 * to leads for conversion/revenue attribution.
 *
 * Trust boundary:
 * - verifies request authenticity via HMAC signature,
 * - rejects unsigned or invalid payloads,
 * - logs unmatched conversions for operational follow-up.
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin' // Use Admin SDK for server routes
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { verifyHmacSignature } from '@/lib/security/hmac'

// Secure Webhook for CRM Integration
// Headers:
//   X-Client-Id: "epilux"
//   X-Signature: "hmac_sha256_hash_of_body"
// Body:
// {
//   "phone": "+79991234567",
//   "amount": 5000,
//   "status": "paid",
//   "items": ["Laser"]
// }

export async function POST(req: NextRequest) {
  try {
    // 1. Read Raw Body (Important for HMAC!)
    const rawBody = await req.text(); 
    if (!rawBody) {
        return NextResponse.json({ error: 'Empty body' }, { status: 400 });
    }

    // 2. Extract Headers
    const signature = req.headers.get('x-signature');
    const clinicIdHeader = req.headers.get('x-client-id');

    if (!signature || !clinicIdHeader) {
        return NextResponse.json({ error: 'Missing security headers (X-Signature or X-Client-Id)' }, { status: 401 });
    }

    // 3. Resolve clinic by docId or slug for compatibility
    const clinicByIdRef = adminDb.collection('clinics').doc(clinicIdHeader);
    const clinicByIdDoc = await clinicByIdRef.get();
    let clinicDoc = clinicByIdDoc;
    let clinicId = clinicIdHeader;

    if (!clinicByIdDoc.exists) {
        const slugSnap = await adminDb.collection('clinics')
            .where('slug', '==', clinicIdHeader)
            .limit(1)
            .get();
        if (!slugSnap.empty) {
            clinicDoc = slugSnap.docs[0];
            clinicId = clinicDoc.id;
        }
    }

    if (!clinicDoc.exists) {
        return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    const { webhookSecret } = clinicDoc.data() || {};

    if (!webhookSecret) {
        // If clinic hasn't generated a secret yet, we deny access by default
        return NextResponse.json({ error: 'Webhook integration not configured for this client' }, { status: 403 });
    }

    // 4. Verify Signature
    const isValid = verifyHmacSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
        console.warn(`[Security] Invalid signature attempt for clinic: ${clinicId}`);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    // 5. Process Data
    const body = JSON.parse(rawBody);
    const { phone, amount, items, status } = body;

    const normalizePhone = (value: string) => value.replace(/\D/g, '');
    const normalizedPhone = typeof phone === 'string' ? normalizePhone(phone) : '';

    // Normalizing phone is crucial here, but for MVP we assume CRM sends clean data or we strip non-digits
    // const cleanPhone = phone.replace(/\D/g, ''); 

    // 6. Find Lead
    // We look for the most recent lead for this phone + clinic
    const leadsRef = adminDb.collection('leads');
    let leadsSnap = await leadsRef
      .where('clinicId', '==', clinicId)
      .where('phoneDigits', '==', normalizedPhone)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    // Backward-compatible fallback (pre-migration)
    if (leadsSnap.empty && typeof phone === 'string') {
      leadsSnap = await leadsRef
        .where('clinicId', '==', clinicId)
        .where('phone', '==', phone)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
    }

    let leadId = null;
    let attribution = null;

    if (!leadsSnap.empty) {
        const leadData = leadsSnap.docs[0].data();
        leadId = leadsSnap.docs[0].id;
        attribution = leadData.tracking || null;

        // Update Lead Status
        await leadsSnap.docs[0].ref.update({
            status: 'converted',
            revenue: FieldValue.increment(Number(amount) || 0),
            updatedAt: FieldValue.serverTimestamp()
        });
    } else {
        const message = `[Webhook] Lead not found for clinic=${clinicId} phone=${phone}`;
        console.warn(message);
        await adminDb.collection('conversion_errors').add({
            clinicId,
            phone: normalizedPhone || phone || null,
            rawPhone: phone || null,
            amount: Number(amount) || 0,
            status: status || null,
            items: items || [],
            source: 'webhook',
            createdAt: FieldValue.serverTimestamp(),
            message
        });
    }

    // 7. Save Conversion Record
    await adminDb.collection('conversions').add({
        clinicId,
        leadId,
        phone: normalizedPhone || phone,
        phoneDigits: normalizedPhone || null,
        amount: Number(amount),
        currency: 'RUB', // Default
        items: items || [],
        status: status || 'paid',
        attribution,
        source: 'webhook',
        createdAt: FieldValue.serverTimestamp()
    });

    return NextResponse.json({ success: true, leadFound: !!leadId });

  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
