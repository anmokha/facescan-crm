import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clinicIdParam = searchParams.get('clinicId')

  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const decoded = await adminAuth.verifyIdToken(idToken)
    const clinicId = clinicIdParam || decoded.uid

    if (clinicId !== decoded.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 1. Get Clinic Settings (Plan & Limits)
    const clinicSnap = await adminDb.collection('clinics').doc(clinicId).get()
    const clinicData = clinicSnap.data() || {}
    
    const plan = clinicData.plan || 'trial'
    const limit = clinicData.limits?.leads || (plan === 'trial' ? 10 : 10000)
    
    // 2. Count Leads
    const leadsSnap = await adminDb.collection('leads')
        .where('clinicId', '==', clinicId)
        .count()
        .get()
    
    const usage = leadsSnap.data().count

    return NextResponse.json({
        plan,
        status: clinicData.status || 'active',
        usage,
        limit,
        isUnlimited: plan === 'enterprise' || plan === 'pro'
    })

  } catch (error) {
    console.error('Sub status error:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
