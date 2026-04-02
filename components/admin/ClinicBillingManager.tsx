'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { addMonthsUtc } from '@/lib/billing/subscription'
import { Loader2, Save, Calendar, Zap } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'

type BillingData = {
  clinicId: string
  plan: string
  status: string
  subscription: any
  entitlements: any
  usage: {
    leadsInPeriod: number
    periodStart: string
    periodEnd: string
    periodSource: string
  }
  limit: number
  isUnlimited: boolean
}

function toDateInputValue(iso: string | null | undefined) {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  const d = String(date.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function fromDateInputValue(value: string) {
  if (!value) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export default function ClinicBillingManager({ clinicId }: { clinicId: string }) {
  const [data, setData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const [form, setForm] = useState<{
    status: 'active' | 'suspended'
    planKey: 'trial' | 'starter' | 'pro' | 'enterprise'
    subscriptionStatus: 'trialing' | 'active' | 'past_due' | 'canceled'
    currentPeriodStart: string
    currentPeriodEnd: string
    leadsPerPeriod: string
  } | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = await user?.getIdToken()
      const res = await fetch(`/api/admin/clinics/${clinicId}/billing`, { 
        cache: 'no-store' as any,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Failed to load billing')
      setData(json)

      const planKey = (json.subscription?.planKey || json.plan || 'trial') as any
      const subscriptionStatus = (json.subscription?.status || 'trialing') as any
      const leadsPerPeriod =
        typeof json.entitlements?.leadsPerPeriod === 'number'
          ? String(json.entitlements.leadsPerPeriod)
          : typeof json.limit === 'number' && json.limit > 0
            ? String(json.limit)
            : '0'

      setForm({
        status: (json.status || 'active') as any,
        planKey,
        subscriptionStatus,
        currentPeriodStart: json.subscription?.currentPeriodStart
          ? new Date(json.subscription.currentPeriodStart).toISOString()
          : json.usage.periodStart,
        currentPeriodEnd: json.subscription?.currentPeriodEnd
          ? new Date(json.subscription.currentPeriodEnd).toISOString()
          : json.usage.periodEnd,
        leadsPerPeriod
      })
    } catch (e: any) {
      setError(e?.message || 'Failed to load billing')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId, user])

  const periodInfo = useMemo(() => {
    if (!data) return null
    const start = new Date(data.usage.periodStart)
    const end = new Date(data.usage.periodEnd)
    const isExpired = Date.now() >= end.getTime()
    return { start, end, isExpired }
  }, [data])

  const save = async (payload: any) => {
    setSaving(true)
    setError(null)
    try {
      const token = await user?.getIdToken()
      const res = await fetch(`/api/admin/clinics/${clinicId}/billing`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'Failed to save billing')
      await load()
    } catch (e: any) {
      setError(e?.message || 'Failed to save billing')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8 flex items-center gap-3 text-gray-600">
        <Loader2 className="animate-spin" size={18} />
        Loading billing…
      </div>
    )
  }

  if (!data || !form) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8">
        <div className="text-sm text-red-600">{error || 'Billing not available'}</div>
      </div>
    )
  }

  const used = data.usage.leadsInPeriod
  const limit = data.isUnlimited ? null : data.limit
  const percent = limit && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 mb-8 shadow-sm">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={18} className="text-emerald-600" /> Billing (Invoice)
          </h3>
          <div className="text-xs text-gray-500 mt-1 font-mono">
            Period source: {data.usage.periodSource}
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">This period</div>
          <div className="mt-1 flex items-center justify-end gap-2">
            {data.isUnlimited ? (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Zap size={14} /> Unlimited
              </span>
            ) : (
              <span className="text-sm font-bold text-gray-900">
                {used} / {limit}
                {percent !== null ? <span className="text-gray-400 font-mono text-xs ml-2">({percent}%)</span> : null}
              </span>
            )}
          </div>
          {periodInfo?.isExpired ? (
            <div className="text-xs text-red-600 mt-1">Period is expired → leads will be overlimit</div>
          ) : null}
        </div>
      </div>

      {error ? <div className="mb-4 text-sm text-red-600">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Account status</label>
          <select
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as any })}
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subscription status</label>
          <select
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            value={form.subscriptionStatus}
            onChange={(e) => setForm({ ...form, subscriptionStatus: e.target.value as any })}
          >
            <option value="trialing">Trialing</option>
            <option value="active">Active</option>
            <option value="past_due">Past due</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
          <select
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            value={form.planKey}
            onChange={(e) => setForm({ ...form, planKey: e.target.value as any })}
          >
            <option value="trial">Trial</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Leads per period</label>
          <input
            type="number"
            min={0}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            value={form.leadsPerPeriod}
            onChange={(e) => setForm({ ...form, leadsPerPeriod: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">Set 0 for unlimited.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Period start (UTC)</label>
          <input
            type="date"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            value={toDateInputValue(form.currentPeriodStart)}
            onChange={(e) => {
              const iso = fromDateInputValue(e.target.value)
              if (iso) setForm({ ...form, currentPeriodStart: iso })
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Period end (UTC)</label>
          <input
            type="date"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
            value={toDateInputValue(form.currentPeriodEnd)}
            onChange={(e) => {
              const iso = fromDateInputValue(e.target.value)
              if (iso) setForm({ ...form, currentPeriodEnd: iso })
            }}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm"
            onClick={() => {
              const now = new Date()
              setForm((prev) =>
                prev
                  ? {
                      ...prev,
                      currentPeriodStart: now.toISOString(),
                      currentPeriodEnd: addMonthsUtc(now, 1).toISOString(),
                    }
                  : prev
              )
            }}
          >
            Start new month (now)
          </button>

          <button
            type="button"
            disabled={saving}
            className="px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm"
            onClick={() => {
              setForm((prev) => {
                if (!prev) return prev
                const end = new Date(prev.currentPeriodEnd)
                const base = Number.isNaN(end.getTime()) ? new Date() : end
                return { ...prev, currentPeriodEnd: addMonthsUtc(base, 1).toISOString() }
              })
            }}
          >
            Extend +1 month
          </button>
        </div>

        <button
          type="button"
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
          onClick={() =>
            save({
              status: form.status,
              planKey: form.planKey,
              subscriptionStatus: form.subscriptionStatus,
              currentPeriodStart: form.currentPeriodStart,
              currentPeriodEnd: form.currentPeriodEnd,
              leadsPerPeriod: form.leadsPerPeriod,
            })
          }
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Save billing
        </button>
      </div>
    </div>
  )
}