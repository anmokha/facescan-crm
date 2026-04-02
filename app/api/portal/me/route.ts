// API endpoint for Customer Portal data
// GET /api/portal/me
// Returns customer profile, checkup history, and clinic info

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth/sessionService';
import { adminDb } from '@/lib/firebaseAdmin';

export async function GET(request: Request) {
  try {
    // 1. Verify session
    const session = getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json(
        { error: 'Не авторизован. Войдите в систему.' },
        { status: 401 }
      );
    }

    // 2. Get customer data
    const customerRef = adminDb.collection('customers').doc(session.customerId);
    const customerSnap = await customerRef.get();

    if (!customerSnap.exists) {
      return NextResponse.json(
        { error: 'Клиент не найден' },
        { status: 404 }
      );
    }

    const customer = {
      id: customerSnap.id,
      ...customerSnap.data()
    };

    // 3. Get clinic data
    const clinicRef = adminDb.collection('clinics').doc(session.clinicId);
    const clinicSnap = await clinicRef.get();
    const clinic = clinicSnap.exists ? clinicSnap.data() : null;

    // 4. Get checkup history (leads for this customer)
    const leadsRef = adminDb.collection('leads');
    const leadsSnap = await leadsRef
      .where('customerId', '==', session.customerId)
      .where('clinicId', '==', session.clinicId)
      .get();

    const checkupHistory = leadsSnap.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((lead: any) => lead.analysisResult) // Only completed checkups
      .sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA; // Newest first
      });

    const latestCheckup = checkupHistory[0] || null;

    // 5. Return portal data
    return NextResponse.json({
      customer,
      clinic,
      checkupHistory,
      latestCheckup
    });
  } catch (error) {
    console.error('Error in portal/me:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
