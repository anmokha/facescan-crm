import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { normalizePhone, type SupportedCountry } from '@/lib/phone';
import { checkRateLimit } from '@/lib/diagnostic/rateLimit';
import { createHash } from 'crypto';

/**
 * GET /api/portal/check-customer?phone=+79991234567
 *
 * Проверяет существует ли customer с таким телефоном
 */
export async function GET(request: NextRequest) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');
    const clinicId = request.nextUrl.searchParams.get('clinicId');
    const phoneCountry = request.nextUrl.searchParams.get('phoneCountry');
    return checkCustomer(request, phone, clinicId, phoneCountry);
  } catch (error) {
    console.error('Check customer failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/portal/check-customer
 * Body: { phone, clinicId }
 */
export async function POST(request: NextRequest) {
  try {
    const { phone, clinicId, phoneCountry } = await request.json();
    return checkCustomer(request, phone, clinicId, phoneCountry);
  } catch (error) {
    console.error('Check customer failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function checkCustomer(
  request: NextRequest,
  phoneInput: string | null,
  clinicId: string | null,
  phoneCountry: string | null
) {
  if (!clinicId) {
    return NextResponse.json(
      { error: 'Clinic ID required' },
      { status: 400 }
    );
  }

  let phone;
  try {
    const resolvedCountry: SupportedCountry =
      phoneCountry === 'AE' || phoneCountry === 'RU' ? (phoneCountry as SupportedCountry) : 'RU';
    phone = normalizePhone(phoneInput || '', resolvedCountry);
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || 'Invalid phone number' },
      { status: 400 }
    );
  }

  // Basic rate limit to reduce enumeration abuse
  const ipHeader = request.headers.get('x-forwarded-for') || 'unknown';
  const ip = ipHeader.split(',')[0].trim();
  const ua = request.headers.get('user-agent') || 'unknown';
  const rateKey = createHash('sha256')
    .update(`${ip}|${ua}|${clinicId}|check-customer`)
    .digest('hex');
  const allowed = await checkRateLimit(rateKey, 60);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  // Поиск в Firestore
  const snapshot = await adminDb.collection('customers')
    .where('clinicId', '==', clinicId)
    .where('phoneDigits', '==', phone.phoneDigits)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return NextResponse.json({
      exists: false,
      hasPassword: false
    });
  }

  // Пользователь найден - проверяем есть ли пароль
  const customer = snapshot.docs[0].data();

  return NextResponse.json({
    exists: true,
    hasPassword: !!customer.password
  });
}
