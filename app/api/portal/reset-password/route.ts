import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { generatePassword, hashPassword } from '@/lib/auth/passwordUtils';
import { sendSMS } from '@/lib/auth/smsService';
import {
  checkPasswordResetLimit,
  checkPhoneResetLimit,
  checkBlockedIP,
  logPasswordReset,
  verifyCaptcha
} from '@/lib/auth/passwordResetSecurity';
import { getClinicPortalUrl } from '@/lib/server/urlUtils';
import * as admin from 'firebase-admin';
import { normalizePhone } from '@/lib/phone';

/**
 * POST /api/portal/reset-password
 */
export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  let phoneNum = '';

  try {
    const { phone: rawPhone, clinicId, phoneCountry, captchaToken, honeypot } = await request.json();
    phoneNum = rawPhone;

    // 0. Honeypot
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // 1. Blocked IP
    if (await checkBlockedIP(ip)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // 2. IP Rate Limit
    const ipLimit = checkPasswordResetLimit(ip);
    if (!ipLimit.allowed) {
      return NextResponse.json({
        error: `Too many attempts. Try again in ${ipLimit.remainingTime} minutes`
      }, { status: 429 });
    }

    if (!clinicId) {
      return NextResponse.json({ error: 'Clinic ID required' }, { status: 400 });
    }

    if (!rawPhone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }
    let phone;
    try {
      phone = normalizePhone(rawPhone, (phoneCountry || 'RU'));
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || 'Invalid phone number' }, { status: 400 });
    }

    // 3. Phone Rate Limit
    const phoneLimit = await checkPhoneResetLimit(phone.phoneDigits);
    if (!phoneLimit.allowed) {
      return NextResponse.json({ error: phoneLimit.reason }, { status: 429 });
    }

    // 4. CAPTCHA
    if (captchaToken) {
       const isHuman = await verifyCaptcha(captchaToken, ip);
       if (!isHuman) {
         return NextResponse.json({ error: 'Invalid CAPTCHA' }, { status: 400 });
       }
    }

    const snapshot = await adminDb.collection('customers')
      .where('clinicId', '==', clinicId)
      .where('phoneDigits', '==', phone.phoneDigits)
      .limit(1)
      .get();

    if (snapshot.empty) {
      await logPasswordReset(phone.phoneDigits, ip, false, 'not_found');
      return NextResponse.json({
        success: true,
        message: 'Если номер зарегистрирован, на него отправлен новый пароль'
      });
    }

    const customerDoc = snapshot.docs[0];
    const resolvedClinicId = customerDoc.data().clinicId;
    const newPassword = generatePassword();
    const passwordHash = await hashPassword(newPassword);

    const portalUrl = await getClinicPortalUrl(resolvedClinicId);
    const message = `Ваш новый пароль в CureScan: ${newPassword}\n\nВход: ${portalUrl}`;
    const sent = await sendSMS(phone.phoneE164, message);

    if (!sent) {
      await logPasswordReset(phone.phoneDigits, ip, false, 'sms_failed');
      return NextResponse.json({ error: 'SMS error' }, { status: 500 });
    }

    await customerDoc.ref.update({
      password: passwordHash,
      passwordResetAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await logPasswordReset(phone.phoneDigits, ip, true, 'success');

    return NextResponse.json({
      success: true,
      message: 'Новый пароль отправлен на ваш номер'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    if (phoneNum) await logPasswordReset(phoneNum, ip, false, 'internal_error');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
