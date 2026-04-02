'use client'

import React, { useEffect, useState } from 'react'
import { ArrowUpRight, Users, Activity, CreditCard, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { getDashboardStats, getRecentConversions, DashboardStats } from '@/lib/diagnostic/dashboardService'
import { ConversionFunnelChart } from '@/components/dashboard/analytics/ConversionFunnelChart'
import { useDashboardI18n } from '@/lib/i18n/dashboard'

export default function DashboardPage() {
  const { user } = useAuth()
  const { messages } = useDashboardI18n()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [conversions, setConversions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const clinicId = user?.uid || 'default'

  useEffect(() => {
    async function loadStats() {
      if (!user) return
      try {
        const [statsData, convData] = await Promise.all([
            getDashboardStats(clinicId),
            getRecentConversions(clinicId)
        ])
        setStats(statsData)
        setConversions(convData)
        setError(null)
      } catch (e) {
        console.error("Failed to load dashboard stats", e)
        setError(e instanceof Error ? e.message : 'Failed to load dashboard stats')
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [user, clinicId])


  if (loading) {
      return <div className="p-12 text-center text-slate-400">{messages.dashboardOverviewLoading}</div>
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-3xl border border-slate-100 p-10 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Overview unavailable</h2>
        <p className="text-slate-500">
          {error || 'Failed to load dashboard statistics.'}
        </p>
        <p className="text-sm text-slate-400 mt-3">
          If this is a permissions error, try signing out and signing in again.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Lead Flow Overview</h2>
          <p className="text-slate-500">Visualizing the customer journey from ad to revenue.</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Conversion Rate</div>
          <div className="text-3xl font-black text-slate-900">{stats.totalLeads ? Math.round((stats.conversions/stats.totalLeads)*100) : 0}%</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Clicks" value={stats.totalClicks} icon={<Users size={20} className="text-blue-500" />} trend="-" />
        <StatCard title="Checkups" value={stats.totalCheckups} icon={<Activity size={20} className="text-cyan-500" />} trend="-" />
        <StatCard title="Conversions" value={stats.conversions} icon={<ArrowUpRight size={20} className="text-amber-500" />} trend={`${stats.totalLeads ? Math.round((stats.conversions/stats.totalLeads)*100) : 0}%`} />
        <StatCard title="Leads (Phone)" value={stats.totalLeads} icon={<CreditCard size={20} className="text-green-500" />} trend="-" />
      </div>

      {/* Conversion Funnel Chart */}
      <div className="mb-8">
        <ConversionFunnelChart data={stats.funnelData} />
      </div>

      {/* Recent Conversions Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-900">Recent Sales</h3>
        </div>
        
        {conversions.length > 0 ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Services</th>
                            <th className="px-6 py-4">Client</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {conversions.map((conv) => (
                            <tr key={conv.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 text-slate-500">
                                    {conv.createdAt?.seconds ? new Date(conv.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                                </td>
                                <td className="px-6 py-4 font-bold text-emerald-600">
                                    +${conv.amount?.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {conv.items?.map((item: string, i: number) => (
                                            <span key={i} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600 border border-slate-200">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-900 font-medium">
                                    {conv.leadId ? 'ID: ' + conv.leadId.slice(0, 8) + '...' : 'Anonymous'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="p-12 text-center flex flex-col items-center justify-center text-slate-400">
                <ShoppingBag size={48} className="mb-4 opacity-20" />
                <p>No sales yet.</p>
                <p className="text-sm">Data will appear after CRM connection.</p>
            </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, trend }: any) {
    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{trend}</span>
            </div>
            <p className="text-slate-500 text-sm mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
        </div>
    )
}

// CustomTooltip removed as it is not needed for LeadStreamChart
