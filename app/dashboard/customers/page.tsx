'use client'

import React, { useEffect, useState } from 'react'
import { getCustomers, Customer } from '@/lib/diagnostic/dashboardService'
import { useAuth } from '@/lib/auth/AuthContext'
import { Search, ChevronRight, User, Calendar, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CustomerCreateModal from '@/components/dashboard/CustomerCreateModal'
import { useDashboardI18n } from '@/lib/i18n/dashboard'

export default function CustomersPage() {
  const { user } = useAuth()
  const { locale, messages } = useDashboardI18n()
  const clinicId = user?.uid || 'default'
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDueOnly, setShowDueOnly] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const loadCustomers = async () => {
    if (!user) return
    try {
        setLoading(true)
        const data = await getCustomers(clinicId)
        setCustomers(data)
    } catch (e) {
        console.error(e)
    } finally {
        setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [user, clinicId])

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.phone.includes(searchQuery) || (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    if (!matchesSearch) return false
    if (!showDueOnly) return true
    return isDueForCheckup(c)
  })
  const dueCount = customers.filter(isDueForCheckup).length

  if (loading) return <div className="p-12 text-center text-slate-400">{messages.customersLoading}</div>

  return (
    <div className="relative min-h-screen pb-20">
      
      {/* Header & Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">{messages.customersPageTitle}</h1>
                <p className="text-slate-500 mt-1">{messages.customersPageTotalLabel} {customers.length}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                <button
                    onClick={() => setIsCreating(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                    <Plus size={18} />
                    {messages.customersCreateButton}
                </button>
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder={messages.customersSearchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button
                    onClick={() => setShowDueOnly((prev) => !prev)}
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-colors ${
                      showDueOnly ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                    <Calendar size={16} />
                    {messages.customersFilterButton}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      showDueOnly ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {dueCount}
                    </span>
                </button>
            </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-black">{messages.customersTableClient}</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-black">{messages.customersTableLastVisit}</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-black">{messages.customersTableCheckups}</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-wider font-black">Skin Score</th>
                        <th className="px-6 py-4"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map(customer => {
                        const due = isDueForCheckup(customer)
                        const nextCheckup = getNextCheckupDate(customer)
                        return (
                        <tr 
                            key={customer.id} 
                            onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                            className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{customer.name || messages.customersNoName}</div>
                                        <div className="text-slate-500 font-mono text-xs">{customer.phone}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                <div>{customer.lastSeenAt?.seconds ? new Date(customer.lastSeenAt.seconds * 1000).toLocaleDateString(locale) : '-'}</div>
                                {due ? (
                                    <div className="text-xs font-bold text-rose-600 mt-1">{messages.customersRepeatNeeded}</div>
                                ) : nextCheckup ? (
                                    <div className="text-xs text-slate-400 mt-1">{messages.customersRepeatLabel} {formatShortDate(nextCheckup, locale)}</div>
                                ) : null}
                            </td>
                            <td className="px-6 py-4">
                                <span className="inline-flex px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
                                    {customer.totalCheckups}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {customer.lastSkinScore > 0 ? (
                                    <ScoreBadge score={customer.lastSkinScore} />
                                ) : (
                                    <span className="text-slate-400">-</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <ChevronRight className="text-slate-300 group-hover:text-blue-500 transition-colors inline-block" size={20} />
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
            {filteredCustomers.length === 0 && (
                <div className="p-12 text-center text-slate-400">
                    {messages.customersEmptyState}
                </div>
            )}
        </div>
      </div>

      {/* Customer Creation Modal */}
      <CustomerCreateModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        onSuccess={loadCustomers}
      />
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
    let color = 'bg-emerald-100 text-emerald-800';
    if (score < 60) color = 'bg-red-100 text-red-800';
    else if (score < 85) color = 'bg-amber-100 text-amber-800';

    return (
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs ${color}`}>
            {score}
        </span>
    )
}

const DEFAULT_INTERVAL_DAYS = 21

function getMillis(value: any): number | null {
    if (!value) return null
    if (typeof value.toMillis === 'function') return value.toMillis()
    if (value instanceof Date) return value.getTime()
    if (typeof value.seconds === 'number') return value.seconds * 1000
    return null
}

function getNextCheckupDate(customer: Customer): Date | null {
    const nextMillis = getMillis(customer.nextCheckupAt)
    if (nextMillis) return new Date(nextMillis)
    const lastMillis = getMillis(customer.lastCheckupAt)
    if (!lastMillis) return null
    return new Date(lastMillis + DEFAULT_INTERVAL_DAYS * 24 * 60 * 60 * 1000)
}

function isDueForCheckup(customer: Customer): boolean {
    const next = getNextCheckupDate(customer)
    return next ? next.getTime() <= Date.now() : false
}

function formatShortDate(value: Date, locale: string) {
    return value.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
}
