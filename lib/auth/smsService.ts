// SMSC.ru SMS Service Integration
// Documentation: https://smsc.ru/api/http/

import type { SupportedCountry } from '@/lib/phone'

interface SMSCResponse {
  id?: number;
  cnt?: number;
  error?: string;
  error_code?: number;
}

/**
 * Send custom SMS message via SMSC.ru
 * @param phone Phone number in format +79111234567
 * @param message Message text
 * @returns true if SMS sent successfully
 */
export async function sendSMS(phone: string, message: string): Promise<boolean> {
  const login = process.env.SMSC_LOGIN;
  const apikey = process.env.SMSC_API_KEY;

  if (!login || !apikey) {
    console.error('SMSC credentials not configured');
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] SMS for ${phone}: ${message}`);
      return true;
    }
    throw new Error('SMSC credentials not configured');
  }

  const formattedPhone = phone.replace(/\+/g, '');

  const url = `https://smsc.ru/sys/send.php?login=${encodeURIComponent(login)}&apikey=${encodeURIComponent(apikey)}&phones=${formattedPhone}&mes=${encodeURIComponent(message)}&charset=utf-8&fmt=3`;

  try {
    const response = await fetch(url);
    const raw = await response.text();

    try {
      const data: SMSCResponse = JSON.parse(raw);
      if (data.error) {
        console.error('SMSC Error:', data.error, data.error_code);
        return false;
      }
      return data.id !== undefined;
    } catch {
      const upper = raw.toUpperCase();
      if (upper.startsWith('OK')) {
        return true;
      }
      console.error('SMSC Error:', raw);
      return false;
    }
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

/**
 * Send SMS code via SMSC.ru
 * @param phone Phone number in format +79111234567
 * @param code 6-digit verification code
 * @returns true if SMS sent successfully
 */
export async function sendSMSCode(phone: string, code: string, phoneCountry?: SupportedCountry): Promise<boolean> {
  const message =
    phoneCountry === 'AE'
      ? `Your CureScan verification code: ${code}`
      : `Ваш код для входа в CureScan: ${code}`
  return sendSMS(phone, message);
}

/**
 * Generate random 6-digit verification code
 */
export function generateSMSCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
