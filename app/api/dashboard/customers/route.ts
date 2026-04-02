import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'
import { normalizePhone } from '@/lib/phone'

// Same token generation function as submit-lead
const createPublicToken = () => {
    const cryptoApi = globalThis.crypto
    if (cryptoApi?.randomUUID) return cryptoApi.randomUUID()
    if (cryptoApi?.getRandomValues) {
        const bytes = new Uint8Array(16)
        cryptoApi.getRandomValues(bytes)
        return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
    }
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`
}

export async function POST(request: Request) {
    try {
        // 1. Verify authentication
        const authHeader = request.headers.get('Authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split('Bearer ')[1]

        // Get user from token (simplified - in production use proper Firebase Admin auth)
        const { getAuth } = await import('firebase-admin/auth')
        let decodedToken
        try {
            decodedToken = await getAuth().verifyIdToken(token)
        } catch (e) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }

        const clinicId = decodedToken.uid

        // 2. Parse and validate request body
        const body = await request.json()
        const { phone: rawPhone, phoneCountry, name, email, treatmentHistory } = body

        if (!rawPhone) {
            return NextResponse.json({ error: 'Phone is required' }, { status: 400 })
        }

        let phone
        try {
            phone = normalizePhone(rawPhone, (phoneCountry || 'RU'))
        } catch (e: any) {
            return NextResponse.json({ error: e?.message || 'Invalid phone format' }, { status: 400 })
        }

        // 3. Check if customer already exists
        const customersRef = adminDb.collection('customers')
        const existingQuery = customersRef
            .where('clinicId', '==', clinicId)
            .where('phoneDigits', '==', phone.phoneDigits)
            .limit(1)

        const existingSnap = await existingQuery.get()

        if (!existingSnap.empty) {
            return NextResponse.json({
                error: 'Customer with this phone already exists',
                existingCustomerId: existingSnap.docs[0].id
            }, { status: 409 })
        }

        // 4. Build treatmentPlan from treatmentHistory
        let treatmentPlan: any[] = []

        if (treatmentHistory && Array.isArray(treatmentHistory)) {
            treatmentPlan = treatmentHistory.map((treatment: any) => ({
                name: treatment.serviceName,
                price: treatment.price || '',
                status: treatment.completedSessions >= treatment.totalSessions ? 'Completed' : 'In Progress',
                completedSessions: treatment.completedSessions || 0,
                totalSessions: treatment.totalSessions || 0,
                lastSessionDate: treatment.lastSessionDate || null
            }))
        }

        // 5. Generate publicToken
        const publicToken = createPublicToken()

        // 6. Create customer document
        const now = FieldValue.serverTimestamp()

        const customerData = {
            clinicId,
            phone: phone.phoneE164,
            phoneE164: phone.phoneE164,
            phoneDigits: phone.phoneDigits,
            phoneCountry: phone.phoneCountry,
            name: name || '',
            email: email || '',
            publicToken,
            firstSeenAt: now,
            lastSeenAt: now,
            totalCheckups: 0,  // Not yet completed any checkups (manually added)
            lastSkinScore: 0,
            lastSkinType: 'unknown',
            source: 'manual_retention',  // Mark as manually created for retention
            treatmentPlan: treatmentPlan.length > 0 ? treatmentPlan : []
        }

        const newCustomerRef = await customersRef.add(customerData)
        const customerId = newCustomerRef.id

        // 7. Generate retention link
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://curescan.pro'
        try {
            const clinicSnap = await adminDb.collection('clinics').doc(clinicId).get()
            const clinicData = clinicSnap.data() || {}
            const domain = clinicData.isCustomDomainActive && clinicData.customDomain
                ? clinicData.customDomain
                : (clinicData.slug ? `${clinicData.slug}.curescan.pro` : null)
            if (domain) {
                baseUrl = `https://${domain}`
            }
        } catch (e) {
            console.warn('Failed to resolve clinic domain, using default baseUrl')
        }
        const retentionLink = `${baseUrl}/checkup?cid=${customerId}`

        // 8. Return response
        return NextResponse.json({
            success: true,
            customerId,
            publicToken,
            retentionLink,
            journeyLink: `${baseUrl}/journey/${publicToken}`
        })

    } catch (error) {
        console.error('Error creating customer:', error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Failed to create customer'
        }, { status: 500 })
    }
}
