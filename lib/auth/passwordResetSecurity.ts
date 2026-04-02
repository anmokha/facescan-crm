import { adminDb } from '@/lib/firebaseAdmin';
import * as admin from 'firebase-admin';

/**
 * In-memory хранилище лимитов по IP
 */
const ipLimiter = new Map<string, {
  attempts: number;
  resetAt: number;
}>();

/**
 * Очистка старых записей каждые 10 минут
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipLimiter.entries()) {
    if (now > data.resetAt) {
      ipLimiter.delete(ip);
    }
  }
}, 600000);

/**
 * Проверка rate limit по IP адресу
 * Лимит: 3 попытки в час
 */
export function checkPasswordResetLimit(ip: string): {
  allowed: boolean;
  remainingTime?: number;
} {
  const now = Date.now();
  const record = ipLimiter.get(ip);

  if (!record) {
    ipLimiter.set(ip, {
      attempts: 1,
      resetAt: now + 3600000
    });
    return { allowed: true };
  }

  if (now > record.resetAt) {
    ipLimiter.set(ip, {
      attempts: 1,
      resetAt: now + 3600000
    });
    return { allowed: true };
  }

  if (record.attempts >= 3) {
    const remainingMs = record.resetAt - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return {
      allowed: false,
      remainingTime: remainingMinutes
    };
  }

  record.attempts++;
  return { allowed: true };
}

/**
 * Проверка rate limit по номеру телефона
 */
export async function checkPhoneResetLimit(phone: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const normalized = phone.replace(/\D/g, '');
  const attemptsRef = adminDb.collection('password_reset_attempts').doc(normalized);
  const attemptsDoc = await attemptsRef.get();

  const now = Date.now();
  const tenMinutesAgo = now - 600000;
  const oneDayAgo = now - 86400000;

  if (!attemptsDoc.exists) {
    await attemptsRef.set({
      phone: normalized,
      lastResetAt: admin.firestore.FieldValue.serverTimestamp(),
      attempts: [{
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      }]
    });
    return { allowed: true };
  }

  const data = attemptsDoc.data()!;
  const lastResetTimestamp = data.lastResetAt?.toMillis() || 0;

  if (lastResetTimestamp > tenMinutesAgo) {
    const remainingMinutes = Math.ceil((lastResetTimestamp + 600000 - now) / 60000);
    return {
      allowed: false,
      reason: `Подождите ${remainingMinutes} мин`
    };
  }

  const recentAttempts = (data.attempts || []).filter((a: any) => {
    const ts = a.timestamp?.toMillis() || 0;
    return ts > oneDayAgo;
  });

  if (recentAttempts.length >= 3) {
    return {
      allowed: false,
      reason: 'Дневной лимит исчерпан'
    };
  }

  await attemptsRef.update({
    lastResetAt: admin.firestore.FieldValue.serverTimestamp(),
    attempts: admin.firestore.FieldValue.arrayUnion({
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    })
  });

  return { allowed: true };
}

/**
 * Проверка заблокированных IP
 */
export async function checkBlockedIP(ip: string): Promise<boolean> {
  const blockedRef = adminDb.collection('blocked_ips').doc(ip);
  const blockedDoc = await blockedRef.get();

  if (!blockedDoc.exists) return false;

  const data = blockedDoc.data()!;
  if (data.permanent) return true;

  const expiresAt = data.expiresAt?.toMillis() || 0;
  if (expiresAt < Date.now()) {
    await blockedRef.delete();
    return false;
  }

  return true;
}

/**
 * Логирование попытки и детекция атак
 */
export async function logPasswordReset(phone: string, ip: string, success: boolean, reason: string) {
  await adminDb.collection('security_logs').add({
    type: 'password_reset',
    phone: phone.replace(/\D/g, ''),
    ip,
    success,
    reason,
    timestamp: admin.firestore.FieldValue.serverTimestamp()
  });

  if (!success) {
      await detectAbusePattern(ip);
  }
}

async function detectAbusePattern(ip: string) {
  const oneHourAgo = new Date(Date.now() - 3600000);
  const logs = await adminDb.collection('security_logs')
    .where('ip', '==', ip)
    .where('type', '==', 'password_reset')
    .where('timestamp', '>', oneHourAgo)
    .get();

  if (logs.size >= 5) {
    await adminDb.collection('blocked_ips').doc(ip).set({
      ip,
      reason: 'too_many_failed_resets',
      expiresAt: admin.firestore.Timestamp.fromMillis(Date.now() + 86400000), // 24h
      permanent: false
    });
  }
}

import { verifyRecaptcha } from '@/lib/security/recaptcha';
import { verifyTurnstile } from '@/lib/security/turnstile';

/**
 * Проверка CAPTCHA
 */
export async function verifyCaptcha(token: string, ip?: string): Promise<boolean> {
  if (!token) return false;
  
  const provider = (process.env.CAPTCHA_PROVIDER || 'none').toLowerCase();
  
  if (provider === 'recaptcha') {
    return verifyRecaptcha(token, { remoteIp: ip, expectedAction: 'password_reset' });
  }
  
  if (provider === 'turnstile') {
    return verifyTurnstile(token, ip);
  }

  // Fallback to hCaptcha if secret is present
  const secret = process.env.HCAPTCHA_SECRET;
  if (!secret) return true; // Fail safe if not configured

  try {
    const res = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${secret}&response=${token}`
    });
    const data = await res.json();
    return data.success;
  } catch (e) {
    console.error('hCaptcha error', e);
    return false;
  }
}
