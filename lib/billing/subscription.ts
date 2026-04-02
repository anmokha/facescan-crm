export type ClinicPlanKey = 'trial' | 'starter' | 'pro' | 'enterprise'
export type ClinicSubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled'

type TimestampLike =
  | Date
  | { seconds: number; nanoseconds?: number }
  | { _seconds: number; _nanoseconds?: number }
  | { toDate: () => Date }
  | string
  | number
  | null
  | undefined

function isValidDate(value: Date) {
  return Number.isFinite(value.getTime())
}

export function toDate(value: TimestampLike): Date | null {
  if (!value) return null
  if (value instanceof Date) return isValidDate(value) ? value : null

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    return isValidDate(date) ? date : null
  }

  if (typeof value === 'object' && typeof (value as any).toDate === 'function') {
    try {
      const date = (value as any).toDate()
      return date instanceof Date && isValidDate(date) ? date : null
    } catch {
      return null
    }
  }

  if (typeof value === 'object' && typeof (value as any).seconds === 'number') {
    const date = new Date((value as any).seconds * 1000)
    return isValidDate(date) ? date : null
  }

  if (typeof value === 'object' && typeof (value as any)._seconds === 'number') {
    const date = new Date((value as any)._seconds * 1000)
    return isValidDate(date) ? date : null
  }

  return null
}

export function normalizePlanKey(value: unknown): ClinicPlanKey {
  const v = typeof value === 'string' ? value.toLowerCase() : ''
  if (v === 'starter' || v === 'pro' || v === 'enterprise') return v
  return 'trial'
}

function daysInUtcMonth(year: number, monthIndex0: number) {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate()
}

export function addMonthsUtc(date: Date, months: number) {
  const startYear = date.getUTCFullYear()
  const startMonth = date.getUTCMonth()
  const startDay = date.getUTCDate()

  const totalMonths = startMonth + months
  const year = startYear + Math.floor(totalMonths / 12)
  const month = ((totalMonths % 12) + 12) % 12
  const day = Math.min(startDay, daysInUtcMonth(year, month))

  return new Date(
    Date.UTC(
      year,
      month,
      day,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds()
    )
  )
}

export function resolveBillingPeriod(clinicData: any, now = new Date()) {
  const sub = clinicData?.subscription || {}
  const startFromSub = toDate(sub.currentPeriodStart)
  const endFromSub = toDate(sub.currentPeriodEnd)
  if (startFromSub && endFromSub) {
    return {
      start: startFromSub,
      end: endFromSub,
      source: 'subscription' as const,
      isExpired: now.getTime() >= endFromSub.getTime()
    }
  }

  const createdAt = toDate(clinicData?.createdAt) || toDate(clinicData?.created_at)
  if (createdAt) {
    const monthsDiff =
      (now.getUTCFullYear() - createdAt.getUTCFullYear()) * 12 +
      (now.getUTCMonth() - createdAt.getUTCMonth())

    let start = addMonthsUtc(createdAt, monthsDiff)
    if (start.getTime() > now.getTime()) {
      start = addMonthsUtc(createdAt, monthsDiff - 1)
    }
    const end = addMonthsUtc(start, 1)

    return {
      start,
      end,
      source: 'createdAt_anchor' as const,
      isExpired: false
    }
  }

  const calendarStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
  const calendarEnd = addMonthsUtc(calendarStart, 1)

  return {
    start: calendarStart,
    end: calendarEnd,
    source: 'calendar_month' as const,
    isExpired: false
  }
}

export function resolveLeadLimit(clinicData: any) {
  const plan = normalizePlanKey(clinicData?.plan)

  const entitlementsLimit = clinicData?.entitlements?.leadsPerPeriod
  if (typeof entitlementsLimit === 'number' && Number.isFinite(entitlementsLimit)) {
    return {
      plan,
      limit: entitlementsLimit,
      isUnlimited: entitlementsLimit <= 0,
      source: 'entitlements' as const
    }
  }

  const legacyLimit = clinicData?.limits?.leads
  if (typeof legacyLimit === 'number' && Number.isFinite(legacyLimit)) {
    return {
      plan,
      limit: legacyLimit,
      isUnlimited: legacyLimit <= 0,
      source: 'limits' as const
    }
  }

  if (plan === 'pro' || plan === 'enterprise') {
    return { plan, limit: 0, isUnlimited: true, source: 'default' as const }
  }

  return { plan, limit: plan === 'trial' ? 10 : 10000, isUnlimited: false, source: 'default' as const }
}

