// API endpoint for verifying SMS code and creating customer session
// POST /api/auth/verify-code

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { createSessionToken } from '@/lib/auth/sessionService';
import { generatePassword, hashPassword } from '@/lib/auth/passwordUtils';
import { sendSMS } from '@/lib/auth/smsService';
import { normalizePhone } from '@/lib/phone';
import { getClinicPortalUrl } from '@/lib/server/urlUtils';

export async function POST(request: Request) {
  try {
    const { phone: rawPhone, code, clinicId, phoneCountry } = await request.json();

    let phone;
    try {
      phone = normalizePhone(rawPhone, (phoneCountry || 'RU'));
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message || 'Invalid phone number' },
        { status: 400 }
      );
    }

    // 1. Validate inputs
    if (!phone || !code || !clinicId) {
      return NextResponse.json(
        { error: 'All fields are required: phone, code, clinicId' },
        { status: 400 }
      );
    }

    // 2. Find matching verification code
    const codesRef = adminDb.collection('auth_codes');
    const codeDocId = `${clinicId}_${phone.phoneDigits}`;
    const codeRef = codesRef.doc(codeDocId);
    const codeSnap = await codeRef.get();

    if (!codeSnap.exists) {
      return NextResponse.json(
        { error: 'Invalid or already used code' },
        { status: 400 }
      );
    }
    const codeData = codeSnap.data() || {};
    if (codeData.verified || codeData.code !== code) {
      return NextResponse.json(
        { error: 'Invalid or already used code' },
        { status: 400 }
      );
    }

    // 3. Check expiration (5 minutes)
    const now = Timestamp.now();
    if (now.seconds > codeData.expiresAt.seconds) {
      return NextResponse.json(
        { error: 'Code expired. Request a new one.' },
        { status: 400 }
      );
    }

    // 4. Find or create Customer document
    const customersRef = adminDb.collection('customers');
    const customerSnap = await customersRef
      .where('clinicId', '==', clinicId)
      .where('phoneDigits', '==', phone.phoneDigits)
      .get();

    let customerId: string;
    let isNewCustomer = false;

    if (customerSnap.empty) {
      // Create new customer
      isNewCustomer = true;
      const newCustomerRef = customersRef.doc();
      customerId = newCustomerRef.id;

      const plainPassword = generatePassword();
      const hashedPassword = await hashPassword(plainPassword);

      await newCustomerRef.set({
        clinicId,
        phone: phone.phoneE164,
        phoneE164: phone.phoneE164,
        phoneDigits: phone.phoneDigits,
        phoneCountry: phone.phoneCountry,
        password: hashedPassword,
        passwordCreatedAt: Timestamp.now(),
        totalCheckups: 0,
        lastSkinScore: 0,
        firstSeenAt: Timestamp.now(),
        lastSeenAt: Timestamp.now(),
        createdAt: Timestamp.now()
      });

      console.log('Created new customer with password:', customerId, phone.phoneE164);

      // Send Welcome SMS with password
      const portalUrl = await getClinicPortalUrl(clinicId);
      const message = `Track your skin health and get recommendations on the CureScan portal!\n\nYour password: ${plainPassword}\nLogin: ${phone.phoneE164}\n\nClient Portal: ${portalUrl}`;
      await sendSMS(phone.phoneE164, message);
    } else {
      // Update existing customer
      customerId = customerSnap.docs[0].id;
      const customerData = customerSnap.docs[0].data();
      
      const updates: any = {
        lastSeenAt: Timestamp.now()
      };

      // If existing customer doesn't have a password yet, generate one
      if (!customerData.password) {
        const plainPassword = generatePassword();
        const hashedPassword = await hashPassword(plainPassword);
        updates.password = hashedPassword;
        updates.passwordCreatedAt = Timestamp.now();
        
        console.log('Generating password for existing customer:', customerId, phone.phoneE164);
        const portalUrl = await getClinicPortalUrl(clinicId);
        const message = `Track your skin health and get recommendations on the CureScan portal!\n\nYour password: ${plainPassword}\nLogin: ${phone.phoneE164}\n\nClient Portal: ${portalUrl}`;
        await sendSMS(phone.phoneE164, message);
      }

      updates.phone = customerData.phoneE164 || customerData.phone || phone.phoneE164;
      updates.phoneE164 = customerData.phoneE164 || phone.phoneE164;
      updates.phoneDigits = customerData.phoneDigits || phone.phoneDigits;
      updates.phoneCountry = customerData.phoneCountry || phone.phoneCountry;

      await customersRef.doc(customerId).update(updates);

      console.log('Updated existing customer:', customerId, phone.phoneE164);
    }

    // 5. Mark code as verified
    await codeRef.update({
      verified: true,
      verifiedAt: Timestamp.now()
    });

    // 6. Create session token
    const sessionToken = createSessionToken({
      customerId,
      clinicId,
      phoneE164: phone.phoneE164,
      phoneDigits: phone.phoneDigits,
      phoneCountry: phone.phoneCountry
    });

    // 7. Return session
    return NextResponse.json({
      success: true,
      customerId,
      sessionToken,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
