
import crypto from 'crypto';

/**
 * Verifies the HMAC SHA-256 signature of a request payload.
 * 
 * @param payload - The raw JSON body of the request (as a string)
 * @param signature - The signature provided in the 'X-Signature' header
 * @param secret - The shared secret key stored in the database for this clinic
 * @returns boolean - True if valid, False if forged
 */
export function verifyHmacSignature(payload: string, signature: string, secret: string): boolean {
  if (!payload || !signature || !secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  // Use timingSafeEqual to prevent timing attacks
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
}
