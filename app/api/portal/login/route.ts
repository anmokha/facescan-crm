import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyPassword } from '@/lib/auth/passwordUtils';
import { createSessionToken } from '@/lib/auth/sessionService';
import { normalizePhone } from '@/lib/phone';

/**
 * POST /api/portal/login
 */
export async function POST(request: NextRequest) {
  try {
    const { phone: rawPhone, password, clinicId, phoneCountry } = await request.json();

    if (!clinicId) {
      return NextResponse.json(
        { error: 'Clinic ID required' },
        { status: 400 }
      );
    }

    let phone;
    try {
      phone = normalizePhone(rawPhone, (phoneCountry || 'RU'));
    } catch (e: any) {
      return NextResponse.json(
        { error: e?.message || 'Invalid phone number' },
        { status: 400 }
      );
    }

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Phone and password required' },
        { status: 400 }
      );
    }

    const snapshot = await adminDb.collection('customers')
      .where('clinicId', '==', clinicId)
      .where('phoneDigits', '==', phone.phoneDigits)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      );
    }

    const customerDoc = snapshot.docs[0];
    const customer = customerDoc.data();

    if (!customer.password) {
       return NextResponse.json(
        { error: 'Аккаунт не настроен для входа по паролю' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(
      password,
      customer.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный логин или пароль' },
        { status: 401 }
      );
    }

    const token = createSessionToken({
      customerId: customerDoc.id,
      clinicId: customer.clinicId,
      phoneE164: customer.phoneE164 || customer.phone || phone.phoneE164,
      phoneDigits: customer.phoneDigits || phone.phoneDigits,
      phoneCountry: customer.phoneCountry || phone.phoneCountry
    });

    return NextResponse.json({
      token,
      customer: {
        id: customerDoc.id,
        phone: customer.phoneE164 || customer.phone,
        clinicId: customer.clinicId
      }
    });

  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json(
      { error: 'Ошибка входа' },
      { status: 500 }
    );
  }
}
