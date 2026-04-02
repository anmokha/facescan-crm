import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'

const getBaseUrl = (domain?: string | null) => {
  const raw = domain
    ? `https://${domain}`
    : (process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://curescan.pro')
  return raw.endsWith('/') ? raw.slice(0, -1) : raw
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.split('Bearer ')[1]
    const decoded = await adminAuth.verifyIdToken(idToken)

    const { customerId } = await request.json()
    if (!customerId) {
      return NextResponse.json({ error: 'Customer ID is required' }, { status: 400 })
    }

    const customerRef = adminDb.collection('customers').doc(customerId)
    const customerSnap = await customerRef.get()

    if (!customerSnap.exists) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customer = customerSnap.data() || {}
    if (customer.clinicId !== decoded.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (!customer.email) {
      return NextResponse.json({ error: 'Customer has no email' }, { status: 400 })
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    let domain: string | null = null
    try {
      const clinicSnap = await adminDb.collection('clinics').doc(customer.clinicId).get()
      const clinicData = clinicSnap.data() || {}
      domain = clinicData.isCustomDomainActive && clinicData.customDomain
        ? clinicData.customDomain
        : (clinicData.slug ? `${clinicData.slug}.curescan.pro` : null)
    } catch (e) {
      console.warn('Failed to resolve clinic domain for invite')
    }

    const baseUrl = getBaseUrl(domain)
    const checkupUrl = `${baseUrl}/checkup?cid=${customerId}&mode=followup`
    const journeyUrl = customer.publicToken ? `${baseUrl}/journey/${customer.publicToken}` : null

    const html = `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
        <h2 style="margin-bottom: 8px;">Time to check your progress</h2>
        <p style="margin: 0 0 16px;">We recommend a follow-up checkup to see changes after procedures and care.</p>
        <a href="${checkupUrl}" style="display: inline-block; background: #0f172a; color: #fff; padding: 12px 18px; border-radius: 10px; font-weight: 700; text-decoration: none;">Start Follow-up Checkup</a>
        ${journeyUrl ? `<p style="margin-top: 16px;"><a href="${journeyUrl}" style="color: #2563eb; font-weight: 600; text-decoration: none;">View My Progress</a></p>` : ''}
        <p style="margin-top: 16px; font-size: 12px; color: #64748b;">If the link doesn't open, copy it to your browser: ${checkupUrl}</p>
      </div>
    `

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: 'CureScan <expert@mail.curescan.pro>',
      to: [customer.email],
      subject: 'Time for a follow-up checkup',
      html
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await customerRef.update({
      lastInviteSentAt: FieldValue.serverTimestamp()
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Send invite error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
