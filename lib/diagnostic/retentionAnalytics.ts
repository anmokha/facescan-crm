import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

type RetentionEventPayload = {
  clinicId?: string | null
  customerId?: string | null
  leadId?: string | null
  meta?: Record<string, any>
}

export async function logRetentionEvent(event: string, payload: RetentionEventPayload = {}) {
  if (!event) return
  try {
    await adminDb.collection('analytics_events').add({
      event,
      clinicId: payload.clinicId ?? null,
      customerId: payload.customerId ?? null,
      leadId: payload.leadId ?? null,
      meta: payload.meta ?? {},
      createdAt: FieldValue.serverTimestamp()
    })
  } catch (error) {
    console.warn('Retention analytics log failed:', error)
  }
}
