// API endpoint for requesting SMS verification code
// POST /api/auth/request-code

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';
import { sendSMSCode, generateSMSCode } from '@/lib/auth/smsService';
import { normalizePhone } from '@/lib/phone';

export async function POST(request: Request) {
  try {
    const { phone: rawPhone, clinicId, phoneCountry } = await request.json();

    // 1. Validate phone format
    let phone;
    try {
      phone = normalizePhone(rawPhone, (phoneCountry || 'RU'));
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message || 'Invalid phone number' },
        { status: 400 }
      );
    }

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID required' },
        { status: 400 }
      );
    }

    // 2. Rate limiting (max 3 codes per phone per hour)
    const codesRef = adminDb.collection('auth_codes');
    const codeDocId = `${clinicId}_${phone.phoneDigits}`;
    const codeRef = codesRef.doc(codeDocId);
    const codeSnap = await codeRef.get();
    const now = Timestamp.now();
    const smsLimit = Number(process.env.RATE_LIMIT_MAX_SMS || '10');
    const resolvedSmsLimit = Number.isNaN(smsLimit) ? 10 : smsLimit;
    const windowMsEnv = Number(process.env.RATE_LIMIT_WINDOW_MS_SMS || `${60 * 60 * 1000}`);
    const windowMs = Number.isNaN(windowMsEnv) ? 60 * 60 * 1000 : windowMsEnv;

    let sentCount = 0;
    let windowStartAt = now;

    if (codeSnap.exists) {
      const data = codeSnap.data() || {};
      const windowStart = data.windowStartAt as Timestamp | undefined;
      const currentCount = Number(data.sentCount || 0);

      if (windowStart && now.toMillis() - windowStart.toMillis() < windowMs) {
        sentCount = currentCount;
        windowStartAt = windowStart;
      }
    }

    if (sentCount >= resolvedSmsLimit) {
      return NextResponse.json(
        { error: 'Too many attempts. Try again in an hour.' },
        { status: 429 }
      );
    }

    // 3. Generate verification code
    const code = generateSMSCode();

    // 4. Store in Firestore with TTL
    await codeRef.set({
      phoneE164: phone.phoneE164,
      phoneDigits: phone.phoneDigits,
      phoneCountry: phone.phoneCountry,
      clinicId,
      code,
      createdAt: now,
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)), // 5 minutes
      verified: false,
      sentCount: sentCount + 1,
      windowStartAt
    });

    // 5. Send SMS via SMSC.ru
    const sent = await sendSMSCode(phone.phoneE164, code, phone.phoneCountry);

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send SMS. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Code sent to your number'
    });
  } catch (error) {
    console.error('Error in request-code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
