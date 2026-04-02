import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth/sessionService';

/**
 * GET /api/portal/verify-session
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    const decoded = verifySessionToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      valid: true,
      customer: {
        id: decoded.customerId,
        phone: decoded.phoneE164,
        phoneCountry: decoded.phoneCountry,
        phoneDigits: decoded.phoneDigits,
        clinicId: decoded.clinicId
      }
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }
}
