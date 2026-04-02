import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'
import { createHash } from 'crypto'

type TrackingLike =
  | {
      source?: string
      campaign?: string
      content?: string
      medium?: string
      term?: string
      referrer?: string
    }
  | null
  | undefined

type TrafficMetric = 'clicks' | 'checkups' | 'leads'

const utcDateKey = (date = new Date()) => {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const normalizeString = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

export function trafficBucketFromTracking(tracking: TrackingLike): {
  bucket: string
  utmSource: string
  utmCampaign: string
  utmContent: string
} {
  const utmSource = normalizeString((tracking as any)?.source) || 'direct'
  const utmCampaign = normalizeString((tracking as any)?.campaign)
  const utmContent = normalizeString((tracking as any)?.content)
  const bucket = utmCampaign || utmSource || 'direct'
  return { bucket, utmSource, utmCampaign, utmContent }
}

export async function incrementTrafficStat(params: {
  clinicId: string
  tracking?: TrackingLike
  metric: TrafficMetric
  now?: Date
}) {
  const clinicId = normalizeString(params.clinicId)
  if (!clinicId || clinicId === 'default') return

  const { bucket, utmSource, utmCampaign, utmContent } = trafficBucketFromTracking(params.tracking)
  const dateKey = utcDateKey(params.now)
  const id = createHash('sha1').update(`${clinicId}|${dateKey}|${bucket}`).digest('hex')

  const ref = adminDb.collection('traffic_stats').doc(id)
  const update: Record<string, any> = {
    clinicId,
    date: dateKey,
    bucket,
    utm_source: utmSource,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
    updatedAt: FieldValue.serverTimestamp(),
    [params.metric]: FieldValue.increment(1)
  }

  await ref.set(
    {
      ...update,
      createdAt: FieldValue.serverTimestamp(),
      clicks: 0,
      checkups: 0,
      leads: 0
    },
    { merge: true }
  )
}

export async function incrementClinicCheckupCount(clinicId: string) {
  const ref = adminDb.collection('clinics').doc(clinicId)
  await ref.update({
    checkupCount: FieldValue.increment(1),
    updatedAt: FieldValue.serverTimestamp()
  })
}

