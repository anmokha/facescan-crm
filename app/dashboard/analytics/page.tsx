'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import { getLeads, Lead } from '@/lib/diagnostic/dashboardService'
import { useAuth } from '@/lib/auth/AuthContext'
import { TrendingUp, Users, Target, BarChart3, ArrowUpRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { useDashboardI18n } from '@/lib/i18n/dashboard'

// Extended Lead interface to include loose tracking params
interface ExtendedLead extends Lead {
    tracking?: {
        source: string;
        campaign: string;
        content?: string;
        term?: string;
    }
}

type DatePreset = 'today' | 'yesterday' | 'week' | 'all' | 'custom'

type DateRange = {
    start: Date | null;
    end: Date | null;
    preset: DatePreset;
};

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { messages } = useDashboardI18n()
  const clinicId = user?.uid || 'default'
  const [leads, setLeads] = useState<ExtendedLead[]>([])
  const [loading, setLoading] = useState(true)

  // Date Filter State (Default: Today)
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    return { start: today, end: null, preset: 'today' };
  });
  const [showDatePicker, setShowDatePicker] = useState(false)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Click outside listener for date picker
  useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
          if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
              setShowDatePicker(false);
          }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function load() {
      if (!user) return
      try {
        const data = await getLeads(clinicId)
        setLeads(data as ExtendedLead[])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, clinicId])

  // --- Date Helpers ---
  const handleDatePreset = (preset: 'today' | 'yesterday' | 'week' | 'all') => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    switch(preset) {
        case 'today':
            setDateRange({ start: today, end: null, preset: 'today' });
            break;
        case 'yesterday':
            const yest = new Date(today);
            yest.setDate(yest.getDate() - 1);
            const yestEnd = new Date(today);
            yestEnd.setMilliseconds(-1);
            setDateRange({ start: yest, end: yestEnd, preset: 'yesterday' });
            break;
        case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            setDateRange({ start: weekAgo, end: null, preset: 'week' });
            break;
        case 'all':
            setDateRange({ start: null, end: null, preset: 'all' });
            break;
    }
    setShowDatePicker(false);
  }

  const handleCustomDateChange = (field: 'start' | 'end', value: string) => {
    const newDate = value ? new Date(value) : null;
    if (newDate) newDate.setHours(0,0,0,0);
    setDateRange(prev => ({ ...prev, [field]: newDate, preset: 'custom' }));
  }

  const getDateLabel = (preset: DatePreset) => {
    switch (preset) {
      case 'today':
        return messages.analyticsDateToday
      case 'yesterday':
        return messages.analyticsDateYesterday
      case 'week':
        return messages.analyticsDateWeek
      case 'all':
        return messages.analyticsDateAll
      case 'custom':
      default:
        return messages.analyticsDateCustom
    }
  }

  // --- Calculations ---
  const stats = useMemo(() => {
    // 0. Filter leads by date
    const filteredLeads = leads.filter(lead => {
        if (!dateRange.start && !dateRange.end) return true;
        
        const created = lead.createdAt?.seconds ? new Date(lead.createdAt.seconds * 1000) : new Date();
        
        if (dateRange.start && created < dateRange.start) return false;
        
        if (dateRange.end) {
            const endDate = new Date(dateRange.end);
            endDate.setHours(23, 59, 59, 999);
            if (created > endDate) return false;
        }
        return true;
    });

    const total = filteredLeads.length
    const converted = filteredLeads.filter(l => l.status === 'converted').length
    const convRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0'
    const totalRevenue = filteredLeads.reduce((sum, l) => sum + (Number(l.revenue) || 0), 0)

    // Grouping Maps
    const sourcesMap: Record<string, { count: number; converted: number; revenue: number }> = {}
    const campaignsMap: Record<string, { count: number; converted: number; revenue: number; source: string }> = {}
    const contentMap: Record<string, { count: number; converted: number; revenue: number; campaign: string }> = {}

    filteredLeads.forEach(l => {
      const src = l.tracking?.source || 'direct'
      const cmp = l.tracking?.campaign || '(no campaign)'
      const cnt = l.tracking?.content || '' 
      
      const isConv = l.status === 'converted' ? 1 : 0
      const rev = Number(l.revenue) || 0

      // 1. Source Stats
      if (!sourcesMap[src]) sourcesMap[src] = { count: 0, converted: 0, revenue: 0 }
      sourcesMap[src].count++
      sourcesMap[src].converted += isConv
      sourcesMap[src].revenue += rev

      // 2. Campaign Stats
      if (l.tracking?.campaign) {
          if (!campaignsMap[cmp]) campaignsMap[cmp] = { count: 0, converted: 0, revenue: 0, source: src }
          campaignsMap[cmp].count++
          campaignsMap[cmp].converted += isConv
          campaignsMap[cmp].revenue += rev
      }

      // 3. Content Stats (Variations)
      if (cnt) {
          const key = `${cmp} / ${cnt}` 
          if (!contentMap[key]) contentMap[key] = { count: 0, converted: 0, revenue: 0, campaign: cmp }
          contentMap[key].count++
          contentMap[key].converted += isConv
          contentMap[key].revenue += rev
      }
    })

    return {
      total,
      converted,
      convRate,
      totalRevenue,
      sources: Object.entries(sourcesMap).sort((a, b) => b[1].count - a[1].count),
      campaigns: Object.entries(campaignsMap).sort((a, b) => b[1].count - a[1].count),
      content: Object.entries(contentMap).sort((a, b) => b[1].count - a[1].count)
    }
  }, [leads, dateRange])

  if (loading) return <div className="p-12 text-center text-slate-400 font-medium">{messages.analyticsLoading}</div>

  return (
    <div className="pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{messages.analyticsPageTitle}</h2>
            <p className="text-slate-500">{messages.analyticsPageSubtitle}</p>
        </div>

        {/* Date Filter Dropdown */}
        <div className="relative" ref={datePickerRef}>
            <button 
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition-all min-w-[160px]"
            >
                <CalendarIcon size={18} className="text-blue-500" />
                <span>{getDateLabel(dateRange.preset)}</span>
                <ChevronDown size={16} className={`ml-auto text-slate-400 transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
            </button>

            {showDatePicker && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-1 mb-4">
                        <button onClick={() => handleDatePreset('today')} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700 transition-colors">{messages.analyticsDateToday}</button>
                        <button onClick={() => handleDatePreset('yesterday')} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700 transition-colors">{messages.analyticsDateYesterday}</button>
                        <button onClick={() => handleDatePreset('week')} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 text-sm font-bold text-slate-700 transition-colors">{messages.analyticsDateWeek}</button>
                        <button onClick={() => handleDatePreset('all')} className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-blue-50 text-sm font-bold text-blue-600 transition-colors">{messages.analyticsDateAll}</button>
                    </div>
                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{messages.analyticsDateCustom}</p>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold block mb-1 px-1">{messages.analyticsDateFromLabel}</label>
                                <input 
                                    type="date" 
                                    className="w-full text-xs border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 font-bold block mb-1 px-1">{messages.analyticsDateToLabel}</label>
                                <input 
                                    type="date" 
                                    className="w-full text-xs border border-slate-200 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
            title={messages.analyticsCardTotalLeads}
            value={stats.total} 
            icon={<Users className="text-blue-600" />} 
            color="bg-blue-50"
        />
        <StatCard 
            title={messages.analyticsCardConversion}
            value={`${stats.convRate}%`} 
            icon={<Target className="text-purple-600" />} 
            color="bg-purple-50"
        />
        <StatCard 
            title={messages.analyticsCardClients}
            value={stats.converted} 
            icon={<TrendingUp className="text-emerald-600" />} 
            color="bg-emerald-50"
        />
        <StatCard 
            title={messages.analyticsCardRevenue}
            value={stats.totalRevenue.toLocaleString()}
            icon={<BarChart3 className="text-amber-600" />} 
            color="bg-amber-50"
        />
      </div>

      <div className="space-y-8">
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Sources Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
	                    <h3 className="font-bold text-slate-900">{messages.analyticsSourcesTitle}</h3>
	                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{messages.analyticsLeadShareLabel}</span>
	                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase">
                            <tr>
	                                <th className="px-6 py-3">{messages.analyticsTableSource}</th>
	                                <th className="px-6 py-3 text-center">{messages.analyticsTableLeads}</th>
	                                <th className="px-6 py-3 text-center">{messages.analyticsTableConversion}</th>
	                                <th className="px-6 py-3 text-right">{messages.analyticsTableRevenue}</th>
	                            </tr>
	                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {stats.sources.length > 0 ? stats.sources.map(([name, data]) => (
                                <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">{name}</td>
                                    <td className="px-6 py-4 text-center text-slate-600">{data.count}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500">
                                            {data.count > 0 ? ((data.converted / data.count) * 100).toFixed(0) : 0}%
                                        </span>
	                                    </td>
	                                    <td className="px-6 py-4 text-right font-mono text-slate-900">
	                                        {data.revenue > 0 ? data.revenue.toLocaleString() : '—'}
	                                    </td>
	                                </tr>
	                            )) : (
	                                <tr>
	                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
	                                        {messages.analyticsTableNoData}
	                                    </td>
	                                </tr>
	                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Campaigns Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-50">
                    <h3 className="font-bold text-slate-900">{messages.analyticsCampaignsTitle}</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase">
                            <tr>
                                <th className="px-6 py-3">{messages.analyticsCampaignsCampaign}</th>
                                <th className="px-6 py-3 text-center">{messages.analyticsTableLeads}</th>
                                <th className="px-6 py-3 text-right">{messages.analyticsTableRevenue}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {stats.campaigns.length > 0 ? stats.campaigns.map(([name, data]) => (
                                <tr key={name} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-blue-600">{name}</div>
                                        <div className="text-[10px] text-slate-400 uppercase">{data.source}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-600">{data.count}</td>
                                    <td className="px-6 py-4 text-right font-mono text-slate-900 font-bold">
                                        {data.revenue > 0 ? data.revenue.toLocaleString() : '0'}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic">
                                        {messages.analyticsTableNoData}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>

          {/* Content / Variants Table */}
	          {stats.content.length > 0 && (
	              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
	                  <div className="px-6 py-5 border-b border-slate-50">
	                      <h3 className="font-bold text-slate-900">{messages.analyticsContentTitle}</h3>
	                  </div>
                  <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                          <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase">
	                              <tr>
	                                  <th className="px-6 py-3">{messages.analyticsContentVariant}</th>
	                                  <th className="px-6 py-3">{messages.analyticsContentCampaign}</th>
	                                  <th className="px-6 py-3 text-center">{messages.analyticsTableLeads}</th>
	                                  <th className="px-6 py-3 text-center">{messages.analyticsTableConversion}</th>
	                                  <th className="px-6 py-3 text-right">{messages.analyticsTableRevenue}</th>
	                              </tr>
	                          </thead>
                          <tbody className="divide-y divide-slate-50">
                              {stats.content.map(([key, data]) => {
                                  const [campaign, content] = key.split(' / ');
                                  return (
                                      <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                                          <td className="px-6 py-4 font-bold text-purple-700">{content}</td>
                                          <td className="px-6 py-4 text-slate-500 text-xs">{campaign}</td>
                                          <td className="px-6 py-4 text-center text-slate-600">{data.count}</td>
                                          <td className="px-6 py-4 text-center">
                                              <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-bold text-slate-500">
                                                  {data.count > 0 ? ((data.converted / data.count) * 100).toFixed(0) : 0}%
                                              </span>
	                                          </td>
	                                          <td className="px-6 py-4 text-right font-mono text-slate-900">
	                                              {data.revenue > 0 ? data.revenue.toLocaleString() : '—'}
	                                          </td>
	                                      </tr>
	                                  )
                              })}
                          </tbody>
                      </table>
                  </div>
              </div>
          )}

      </div>
    </div>
  )
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start justify-between group hover:shadow-md transition-shadow">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{title}</p>
                <h4 className="text-2xl font-black text-slate-900">{value}</h4>
            </div>
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center`}>
                {icon}
            </div>
        </div>
    )
}
