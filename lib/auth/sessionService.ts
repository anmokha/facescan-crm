/**
 * Customer Session Management (JWT)
 *
 * Security posture for public case:
 * - no hardcoded fallback secret,
 * - token creation requires `CUSTOMER_JWT_SECRET`,
 * - verification fails closed if secret is missing.
 */

import jwt from 'jsonwebtoken';
import type { SupportedCountry } from '@/lib/phone';

const JWT_SECRET = process.env.CUSTOMER_JWT_SECRET;
const JWT_EXPIRY = '30d'; // 30 days

export interface CustomerSession {
  customerId: string;
  clinicId: string;
  phoneE164: string;
  phoneDigits: string;
  phoneCountry: SupportedCountry;
}

/**
 * Create JWT session token for customer
 */
export function createSessionToken(session: CustomerSession): string {
  if (!JWT_SECRET) {
    throw new Error('CUSTOMER_JWT_SECRET is not configured');
  }
  return jwt.sign(session, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

/**
 * Verify and decode JWT session token
 * @returns CustomerSession if valid, null if invalid/expired
 */
export function verifySessionToken(token: string): CustomerSession | null {
  if (!JWT_SECRET) {
    console.error('CUSTOMER_JWT_SECRET is not configured');
    return null;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomerSession;
    return decoded;
  } catch (error) {
    console.error('Invalid session token:', error);
    return null;
  }
}

/**
 * Extract session from Authorization header
 * @param request Next.js Request object
 * @returns CustomerSession if valid, null otherwise
 */
export function getSessionFromRequest(request: Request): CustomerSession | null {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  return verifySessionToken(token);
}
