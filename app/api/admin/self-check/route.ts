import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'
import { verifyAdminToken } from '@/lib/auth/verifyAdmin'
import { getStorage } from 'firebase-admin/storage'
import { FieldValue } from 'firebase-admin/firestore'
import { normalizePhone } from '@/lib/phone'

type CheckResult = {
  ok: boolean
  detail?: any
  error?: string
}

async function requireAdmin(request: NextRequest) {
  const authHeader = request.headers.get('Authorization') || ''
  if (authHeader.startsWith('Bearer ')) {
    return verifyAdminToken(request)
  }

  const sessionCookie = cookies().get('__session')?.value
  if (!sessionCookie) {
    throw new Error('Unauthorized')
  }

  const decoded = await adminAuth.verifySessionCookie(sessionCookie, true).catch(() => null)
  if (!decoded?.admin) {
    throw new Error('Forbidden')
  }

  return {
    uid: decoded.uid,
    email: decoded.email,
    role: decoded.role,
    permissions: decoded.permissions || [],
    assignedClinics: decoded.assignedClinics
  }
}

function hasEnv(name: string) {
  const value = process.env[name]
  return Boolean(value && String(value).trim().length > 0)
}

async function checkFirestoreWriteRead(): Promise<CheckResult> {
  const id = `selfcheck_${Date.now()}_${Math.random().toString(16).slice(2)}`
  const ref = adminDb.collection('self_checks').doc(id)
  try {
    await ref.set({
      createdAt: FieldValue.serverTimestamp(),
      type: 'self-check'
    })
    const snap = await ref.get()
    const exists = snap.exists
    await ref.delete().catch(() => {})
    return { ok: exists, detail: { docExists: exists } }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) }
  }
}

async function checkFirestoreIndexes(): Promise<CheckResult> {
  // These queries are intentionally shaped to require composite indexes in production.
  try {
    // customers: clinicId + phoneDigits
    await adminDb
      .collection('customers')
      .where('clinicId', '==', '__selfcheck__')
      .where('phoneDigits', '==', '000')
      .limit(1)
      .get()

    // leads: clinicId + phoneDigits + orderBy createdAt desc
    await adminDb
      .collection('leads')
      .where('clinicId', '==', '__selfcheck__')
      .where('phoneDigits', '==', '000')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get()

    return { ok: true }
  } catch (e: any) {
    const message = String(e?.message || e)
    // Firestore index errors are typically FAILED_PRECONDITION with a helpful message.
    return { ok: false, error: message }
  }
}

async function checkStorageWriteDelete(): Promise<CheckResult> {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  if (!bucketName) {
    return { ok: false, error: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is not set' }
  }

  const filePath = `self-check/${Date.now()}_${Math.random().toString(16).slice(2)}.txt`
  try {
    const bucket = getStorage().bucket()
    const file = bucket.file(filePath)
    await file.save(Buffer.from('ok'), { metadata: { contentType: 'text/plain' } })
    await file.delete().catch(() => {})
    return { ok: true, detail: { bucket: bucketName } }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) }
  }
}

function checkPhoneNormalization(): CheckResult {
  try {
    const ru = normalizePhone('8 (912) 345-67-89', 'RU')
    const ae = normalizePhone('05 012 34567', 'AE')
    return {
      ok: true,
      detail: {
        RU: ru,
        AE: ae
      }
    }
  } catch (e: any) {
    return { ok: false, error: String(e?.message || e) }
  }
}

export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin(request)

    const env = {
      CUSTOMER_JWT_SECRET: hasEnv('CUSTOMER_JWT_SECRET'),
      GEMINI_API_KEY: hasEnv('GEMINI_API_KEY'),
      FIREBASE_SERVICE_CLIENT_EMAIL: hasEnv('FIREBASE_SERVICE_CLIENT_EMAIL'),
      FIREBASE_SERVICE_PRIVATE_KEY: hasEnv('FIREBASE_SERVICE_PRIVATE_KEY'),
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: hasEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: hasEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
      TELEGRAM_BOT_TOKEN: hasEnv('TELEGRAM_BOT_TOKEN'),
      RESEND_API_KEY: hasEnv('RESEND_API_KEY'),
      CAPTCHA_PROVIDER: hasEnv('CAPTCHA_PROVIDER'),
      TURNSTILE_SECRET_KEY: hasEnv('TURNSTILE_SECRET_KEY'),
      RECAPTCHA_SECRET_KEY: hasEnv('RECAPTCHA_SECRET_KEY')
    }

    const firestore = await checkFirestoreWriteRead()
    const indexes = await checkFirestoreIndexes()
    const storage = await checkStorageWriteDelete()
    const phone = checkPhoneNormalization()

    const overallOk = Boolean(
      env.CUSTOMER_JWT_SECRET &&
        env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        env.FIREBASE_SERVICE_CLIENT_EMAIL &&
        env.FIREBASE_SERVICE_PRIVATE_KEY &&
        env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET &&
        firestore.ok &&
        indexes.ok &&
        storage.ok &&
        phone.ok
    )

    return NextResponse.json({
      ok: overallOk,
      admin: { uid: admin.uid, email: admin.email, role: admin.role },
      env,
      checks: { firestore, indexes, storage, phone }
    })
  } catch (e: any) {
    const msg = String(e?.message || e)
    const status = msg === 'Unauthorized' ? 401 : msg === 'Forbidden' ? 403 : 500
    return NextResponse.json({ ok: false, error: msg }, { status })
  }
}

