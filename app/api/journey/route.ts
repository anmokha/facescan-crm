import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { getStorage } from 'firebase-admin/storage'
import { logRetentionEvent } from '@/lib/diagnostic/retentionAnalytics'

export const dynamic = 'force-dynamic'

const toMillis = (value: any): number | null => {
  if (!value) return null
  if (typeof value === 'number') return value
  if (value.toMillis) return value.toMillis()
  if (value.seconds) return value.seconds * 1000
  return null
}

const getScore = (analysisResult: any): number | null => {
  const score = analysisResult?.profile?.skin_score ?? analysisResult?.profile?.skinScore
  if (typeof score === 'number') return score
  if (typeof score === 'string') {
    const parsed = Number(score)
    return Number.isNaN(parsed) ? null : parsed
  }
  return null
}

const summarizeLead = (lead: any) => {
  return {
    id: lead?.id || null,
    createdAt: toMillis(lead?.createdAt),
    score: getScore(lead?.analysisResult),
    comparison: lead?.comparison || null,
    progress: lead?.progress || null
  }
}

const getSignedUrlForPath = async (path?: string | null): Promise<string | null> => {
  if (!path) return null
  if (path.startsWith('http')) return path
  try {
    const bucket = getStorage().bucket()
    const file = bucket.file(path)
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000
    })
    return url
  } catch (error) {
    console.warn('Signed URL failed:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 })
  }

  try {
    const customerSnap = await adminDb
      .collection('customers')
      .where('publicToken', '==', token)
      .limit(1)
      .get()

    if (customerSnap.empty) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const customerDoc = customerSnap.docs[0]
    const customerData = customerDoc.data()
    const customerId = customerDoc.id

    void logRetentionEvent('journey.opened', {
      clinicId: customerData.clinicId,
      customerId
    })

    let latestLeadDoc: any = null
    if (customerData.lastLeadId) {
      const leadSnap = await adminDb.collection('leads').doc(customerData.lastLeadId).get()
      if (leadSnap.exists) {
        latestLeadDoc = { id: leadSnap.id, ...leadSnap.data() }
      }
    }

    if (!latestLeadDoc) {
      const latestSnap = await adminDb
        .collection('leads')
        .where('customerId', '==', customerId)
        .get()
      const sorted = latestSnap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }))
        .sort((a: any, b: any) => (toMillis(b.createdAt) || 0) - (toMillis(a.createdAt) || 0))
      latestLeadDoc = sorted[0] || null
    }

    let baselineLeadDoc: any = null
    if (customerData.baselineLeadId) {
      const baselineSnap = await adminDb.collection('leads').doc(customerData.baselineLeadId).get()
      if (baselineSnap.exists) {
        baselineLeadDoc = { id: baselineSnap.id, ...baselineSnap.data() }
      }
    }

    if (!baselineLeadDoc) {
      const baselineSnap = await adminDb
        .collection('leads')
        .where('customerId', '==', customerId)
        .get()
      const sorted = baselineSnap.docs
        .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }))
        .sort((a: any, b: any) => (toMillis(a.createdAt) || 0) - (toMillis(b.createdAt) || 0))
      baselineLeadDoc = sorted[0] || null
    }

    let timeline: Array<{ id: string; createdAt: number | null; score: number | null }> = []
    try {
      const historySnap = await adminDb
        .collection('leads')
        .where('customerId', '==', customerId)
        .orderBy('createdAt', 'desc')
        .limit(12)
        .get()
      timeline = historySnap.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          createdAt: toMillis(data.createdAt),
          score: getScore(data.analysisResult)
        }
      }).filter((item) => item.score !== null)
    } catch (historyError) {
      const historySnap = await adminDb
        .collection('leads')
        .where('customerId', '==', customerId)
        .get()
      timeline = historySnap.docs
        .map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            createdAt: toMillis(data.createdAt),
            score: getScore(data.analysisResult)
          }
        })
        .filter((item) => item.score !== null)
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 12)
    }

    const baselinePath = baselineLeadDoc?.storagePaths?.[0] || baselineLeadDoc?.photoUrls?.[0] || null
    const latestPath = latestLeadDoc?.storagePaths?.[0] || latestLeadDoc?.photoUrls?.[0] || null
    const baselineUrl = await getSignedUrlForPath(baselinePath)
    const latestUrl = await getSignedUrlForPath(latestPath)

    return NextResponse.json(
      {
        customer: {
          name: customerData.name || null,
          totalCheckups: customerData.totalCheckups || 0,
          firstSeenAt: toMillis(customerData.firstSeenAt),
          lastCheckupAt: toMillis(customerData.lastCheckupAt),
        },
        baseline: summarizeLead(baselineLeadDoc),
        latest: summarizeLead(latestLeadDoc),
        timeline: timeline.reverse(),
        treatmentPlan: customerData.treatmentPlan || [],
        memoryMirror: baselineUrl && latestUrl ? {
          baselineUrl,
          latestUrl,
          baselineAt: toMillis(baselineLeadDoc?.createdAt),
          latestAt: toMillis(latestLeadDoc?.createdAt)
        } : null
      },
      {
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )
  } catch (error: any) {
    console.error('Journey API error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
