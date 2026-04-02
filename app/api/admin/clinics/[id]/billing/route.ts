import { NextRequest, NextResponse } from 'next/server'
import { FieldValue, Timestamp } from 'firebase-admin/firestore'
import { adminDb } from '@/lib/firebaseAdmin'
import { verifyAdminRequest, requireAnyPermission } from '@/lib/auth/verifyAdmin'
import { Permission } from '@/lib/auth/permissions'
import { AuditLogger } from '@/lib/audit/logger'
import { AuditAction } from '@/lib/audit/schema'
import { addMonthsUtc, normalizePlanKey, resolveBillingPeriod, resolveLeadLimit } from '@/lib/billing/subscription'

function parseIsoDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await verifyAdminRequest(request)
    requireAnyPermission(adminUser, [Permission.CLINICS_READ, Permission.BILLING_MANAGE])

    const clinicRef = adminDb.collection('clinics').doc(params.id)
    const clinicSnap = await clinicRef.get()
    if (!clinicSnap.exists) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    const clinicData = clinicSnap.data() || {}
    const period = resolveBillingPeriod(clinicData)
    const { plan, limit, isUnlimited } = resolveLeadLimit(clinicData)

    const leadsSnap = await adminDb
      .collection('leads')
      .where('clinicId', '==', params.id)
      .where('createdAt', '>=', Timestamp.fromDate(period.start))
      .where('createdAt', '<', Timestamp.fromDate(period.end))
      .orderBy('createdAt', 'desc')
      .count()
      .get()

    const usage = leadsSnap.data().count

    return NextResponse.json({
      clinicId: params.id,
      plan,
      status: clinicData.status || 'active',
      subscription: clinicData.subscription || null,
      entitlements: clinicData.entitlements || null,
      usage: {
        leadsInPeriod: usage,
        periodStart: period.start.toISOString(),
        periodEnd: period.end.toISOString(),
        periodSource: period.source,
      },
      limit,
      isUnlimited,
    })
  } catch (error: any) {
    const message = String(error?.message || error)
    if (message.includes('Missing Authorization') || message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (message.includes('Forbidden') || message.includes('Missing required permissions')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('GET /api/admin/clinics/[id]/billing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminUser = await verifyAdminRequest(request)
    requireAnyPermission(adminUser, [Permission.BILLING_MANAGE, Permission.CLINICS_UPDATE])

    const body = await request.json().catch(() => ({}))

    const planKey = normalizePlanKey(body.planKey)
    const legacyStatus = typeof body.status === 'string' ? body.status : undefined
    const subscriptionStatus = typeof body.subscriptionStatus === 'string' ? body.subscriptionStatus : undefined

    const periodStart = parseIsoDate(body.currentPeriodStart)
    const periodEnd = parseIsoDate(body.currentPeriodEnd)

    const leadsPerPeriod =
      typeof body.leadsPerPeriod === 'number' && Number.isFinite(body.leadsPerPeriod)
        ? body.leadsPerPeriod
        : typeof body.leadsPerPeriod === 'string'
          ? Number(body.leadsPerPeriod)
          : undefined

    if (periodStart && periodEnd && periodStart.getTime() >= periodEnd.getTime()) {
      return NextResponse.json({ error: 'Invalid period: start must be before end' }, { status: 400 })
    }

    if (leadsPerPeriod !== undefined && (!Number.isFinite(leadsPerPeriod) || leadsPerPeriod < 0)) {
      return NextResponse.json({ error: 'Invalid leadsPerPeriod' }, { status: 400 })
    }

    const clinicRef = adminDb.collection('clinics').doc(params.id)
    const clinicSnap = await clinicRef.get()
    if (!clinicSnap.exists) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 })
    }

    const before = clinicSnap.data() || {}

    const updates: Record<string, any> = {
      plan: planKey,
      updatedAt: FieldValue.serverTimestamp(),
      'subscription.planKey': planKey,
      'subscription.updatedAt': FieldValue.serverTimestamp(),
      'subscription.updatedBy': { type: 'admin', uid: adminUser.uid, email: adminUser.email },
    }

    if (legacyStatus === 'active' || legacyStatus === 'suspended') {
      updates.status = legacyStatus
    }

    if (subscriptionStatus && ['trialing', 'active', 'past_due', 'canceled'].includes(subscriptionStatus)) {
      updates['subscription.status'] = subscriptionStatus
      updates.subscriptionStatus = subscriptionStatus
    }

    if (periodStart) {
      updates['subscription.currentPeriodStart'] = periodStart
      updates['usage.periodStart'] = periodStart
    }
    if (periodEnd) {
      updates['subscription.currentPeriodEnd'] = periodEnd
      updates['usage.periodEnd'] = periodEnd
    }

    if (leadsPerPeriod !== undefined) {
      updates['entitlements.leadsPerPeriod'] = leadsPerPeriod
      updates['limits.leads'] = leadsPerPeriod
    }

    // Convenience: if period boundaries are missing, initialize to "now + 1 month"
    const needsPeriodInit = !before.subscription?.currentPeriodStart || !before.subscription?.currentPeriodEnd
    if (needsPeriodInit && !periodStart && !periodEnd) {
      const now = new Date()
      const end = addMonthsUtc(now, 1)
      updates['subscription.currentPeriodStart'] = now
      updates['subscription.currentPeriodEnd'] = end
      updates['usage.periodStart'] = now
      updates['usage.periodEnd'] = end
    }

    await clinicRef.update(updates)

    const afterSnap = await clinicRef.get()
    const after = afterSnap.data() || {}

    await AuditLogger.logChange(
      AuditAction.UPDATE_CLINIC,
      request,
      adminUser,
      'clinic',
      params.id,
      {
        plan: before.plan,
        status: before.status,
        subscription: before.subscription,
        entitlements: before.entitlements,
        limits: before.limits,
      },
      {
        plan: after.plan,
        status: after.status,
        subscription: after.subscription,
        entitlements: after.entitlements,
        limits: after.limits,
      }
    )

    return NextResponse.json({ success: true })
  } catch (error: any) {
    const message = String(error?.message || error)
    if (message.includes('Missing Authorization') || message.includes('Unauthorized')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (message.includes('Forbidden') || message.includes('Missing required permissions')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    console.error('PATCH /api/admin/clinics/[id]/billing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

