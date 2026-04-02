'use client'

import React, { useEffect, useState } from 'react'
import { getCustomerDetails, getCustomerHistory, updateCustomer, Customer, Lead } from '@/lib/diagnostic/dashboardService'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Calendar, Copy, Check, MessageCircle, MoreHorizontal, Edit2, X, Save, ChevronRight, Mail } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import LeadDetailsModal from '@/components/admin/LeadDetailsModal'
import { useAuth } from '@/lib/auth/AuthContext'
import { useDashboardI18n } from '@/lib/i18n/dashboard'

export default function CustomerProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { locale, messages } = useDashboardI18n()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [history, setHistory] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [portalCopied, setPortalCopied] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteMessage, setInviteMessage] = useState<string | null>(null)

  // Editing State
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')

  useEffect(() => {
    async function load() {
        try {
            const c = await getCustomerDetails(params.id)
            setCustomer(c)
            if (c) {
                setNameInput(c.name || '')
                const h = await getCustomerHistory(params.id)
                setHistory(h)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
    load()
  }, [params.id])

  const handleSaveName = async () => {
      if (!customer) return;
      try {
          await updateCustomer(customer.id, { name: nameInput });
          setCustomer({ ...customer, name: nameInput });
          setIsEditingName(false);
      } catch (e) {
          alert(messages.customerSaveNameError);
      }
  }

  if (loading) return <div className="p-12 text-center text-slate-400">{messages.customerLoading}</div>
  if (!customer) return <div className="p-12 text-center text-slate-400">{messages.customerNotFound}</div>

  // Prepare Chart Data
  const chartData = history
    .filter(h => h.analysisResult?.profile?.skin_score)
    .map(h => ({
        date: h.createdAt?.seconds ? new Date(h.createdAt.seconds * 1000).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : '',
        score: h.analysisResult?.profile?.skin_score || 0
    }))
    .reverse(); // Show oldest to newest

  const copyLink = () => {
      // Assuming the app runs on the current domain
      const origin = window.location.origin;
      const url = `${origin}/checkup?cid=${customer.id}&mode=followup`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  }

  const copyPortalLink = () => {
      if (!customer.publicToken) {
          alert(messages.customerPortalLinkUnavailable);
          return;
      }
      const origin = window.location.origin;
      const url = `${origin}/journey/${customer.publicToken}`;
      navigator.clipboard.writeText(url);
      setPortalCopied(true);
      setTimeout(() => setPortalCopied(false), 2000);
  }

  const handleSendInvite = async () => {
      if (!customer.email) {
          setInviteMessage(messages.customerEmailMissing)
          return
      }
      if (!user) {
          setInviteMessage(messages.customerInviteNoAccess)
          return
      }
      setInviteSending(true)
      setInviteMessage(null)
      try {
          const token = await user.getIdToken()
          const res = await fetch('/api/dashboard/send-checkup-invite', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ customerId: customer.id })
          })
          const data = await res.json()
          if (!res.ok) {
              throw new Error(data?.error || messages.customerInviteSendFailed)
          }
          setInviteMessage(messages.customerInviteSent)
      } catch (e) {
          const message = e instanceof Error ? e.message : messages.customerInviteSendFailed
          setInviteMessage(message)
      } finally {
          setInviteSending(false)
      }
  }

  const nextCheckup = getNextCheckupDate(customer)
  const isDue = isDueForCheckup(customer)

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={20} /> {messages.customerBackButton}
      </button>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 h-10">
                    {isEditingName ? (
                        <div className="flex items-center gap-2 w-full">
	                            <input 
	                                type="text" 
	                                value={nameInput}
	                                onChange={(e) => setNameInput(e.target.value)}
	                                className="text-3xl font-bold text-slate-900 border-b-2 border-blue-500 focus:outline-none bg-transparent px-1 min-w-[300px]"
	                                autoFocus
	                                placeholder={messages.customerNameInputPlaceholder}
	                                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
	                            />
	                            <button onClick={handleSaveName} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200" title={messages.customerSaveTitle}>
	                                <Save size={18} />
	                            </button>
	                            <button onClick={() => setIsEditingName(false)} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200" title={messages.customerCancelTitle}>
	                                <X size={18} />
	                            </button>
	                        </div>
	                    ) : (
	                        <div className="flex items-center gap-3 group">
	                            <h1 className={`text-3xl font-bold ${customer.name ? 'text-slate-900' : 'text-slate-300 italic'}`}>
	                                {customer.name || messages.customerNamePlaceholder}
	                            </h1>
	                            <button 
	                                onClick={() => setIsEditingName(true)}
	                                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-400 hover:text-blue-500 hover:bg-slate-50 rounded-lg"
	                                title={messages.customerEditTitle}
	                            >
	                                <Edit2 size={18} />
	                            </button>
                        </div>
                    )}
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-slate-500">
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-sm font-bold text-slate-700">
                         {/* Using Phone icon from lucide-react (make sure it's imported) - actually I need to check imports */}
                         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                         {customer.phone}
                    </span>
	                    <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full text-sm font-medium">
	                        <Calendar size={14} /> 
	                        {messages.customerFirstSeenLabel} {customer.firstSeenAt?.seconds ? new Date(customer.firstSeenAt.seconds * 1000).toLocaleDateString(locale) : '-'}
	                    </span>
	                    <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full text-sm font-medium">
	                        <MessageCircle size={14} /> 
	                        {messages.customerCheckupsLabel} {customer.totalCheckups}
	                    </span>
                </div>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
                <button 
                    onClick={copyPortalLink}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
	                >
	                    {portalCopied ? <Check size={18} /> : <ExternalLink size={18} />}
	                    {portalCopied ? messages.customerPortalCopied : messages.customerPortalButton}
	                </button>
                <button 
                    onClick={copyLink}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors"
	                >
	                    {copied ? <Check size={18} /> : <Copy size={18} />}
	                    {copied ? messages.customerRetentionCopied : messages.customerRetentionButton}
	                </button>
                <button
                    onClick={handleSendInvite}
                    disabled={inviteSending || !customer.email}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-60"
	                >
	                    <Mail size={18} />
	                    {inviteSending ? messages.customerSendingEmail : messages.customerSendEmailButton}
	                </button>
                <a 
                    href={`https://wa.me/${customer.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl hover:bg-emerald-100 transition-colors"
	                >
	                    <MessageCircle size={18} /> {messages.customerWhatsAppButton}
	                </a>
            </div>
        </div>
        {inviteMessage && (
            <div className="mt-4 text-sm font-medium text-slate-500">
                {inviteMessage}
            </div>
        )}
      </div>

      {/* Treatment Plan */}
	      {customer.treatmentPlan && customer.treatmentPlan.length > 0 && (
	        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
	          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
	            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><rect width="20" height="8" x="2" y="14" rx="2"/></svg>
	            {messages.customerTreatmentHistoryTitle}
	          </h3>
          <div className="space-y-3">
            {customer.treatmentPlan.map((treatment, idx) => {
              const isCompleted = treatment.status === 'Completed' || treatment.completedAt;
              const sessionsCompleted = treatment.completedSessions || 0;
              const sessionsTotal = treatment.totalSessions || 0;
              const progress = sessionsTotal > 0 ? (sessionsCompleted / sessionsTotal) * 100 : 0;

              return (
                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  <div className="flex-1">
                    <div className="font-bold text-slate-900 mb-1">{treatment.name}</div>
	                    <div className="flex items-center gap-3 text-sm">
	                      <span className="text-slate-500">
	                        {sessionsCompleted} {messages.customerTreatmentSessionsLabel} {sessionsTotal || '?'} {messages.customerTreatmentSessionsText}
	                      </span>
                      {treatment.price && (
                        <span className="text-slate-400">• {treatment.price}</span>
                      )}
	                      {treatment.lastSessionDate && (
	                        <span className="text-slate-400">
	                          • {messages.customerTreatmentLastVisit} {new Date(treatment.lastSessionDate).toLocaleDateString(locale)}
	                        </span>
	                      )}
                    </div>
                    {/* Progress Bar */}
                    {sessionsTotal > 0 && (
                      <div className="mt-2 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full transition-all ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className={`mt-3 md:mt-0 md:ml-4 px-3 py-1 rounded-full text-xs font-bold ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
	                    {isCompleted ? messages.customerTreatmentCompleted : messages.customerTreatmentInProgress}
	                  </div>
	                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Chart & Stats */}
        <div className="lg:col-span-2 space-y-8">
            {/* Chart */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">{messages.customerChartTitle}</h3>
                <div className="h-64 w-full">
                    {chartData.length > 1 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fill: '#94a3b8', fontSize: 12}}
                                    dy={10}
                                />
                                <YAxis 
                                    domain={[0, 100]} 
                                    hide 
                                />
                                <Tooltip 
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="score" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3} 
                                    dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}}
                                    activeDot={{r: 6}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            {messages.customerChartNoData}
                        </div>
                    )}
                </div>
            </div>

            {/* History Timeline */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">{messages.customerHistoryTitle}</h3>
                <div className="space-y-4">
                    {history.map((lead) => (
                        <div 
                            key={lead.id}
                            onClick={() => setSelectedLead(lead)}
                            className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all cursor-pointer group"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${getScoreColor(lead.analysisResult?.profile?.skin_score)}`}>
                                    {lead.analysisResult?.profile?.skin_score || '?'}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">
                                        {lead.createdAt?.seconds ? new Date(lead.createdAt.seconds * 1000).toLocaleDateString(locale, { day: 'numeric', month: 'long' }) : messages.customerHistoryUnknownDate}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {lead.diagnosticType === 'skin' ? messages.customerDiagnosticTypeSkin : lead.diagnosticType} • {lead.tracking?.source || 'Direct'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <div className="text-xs font-bold text-slate-700">
                                        {lead.analysisResult?.profile?.skinType || lead.analysisResult?.profile?.skin_type || ''}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                        {lead.analysisResult?.hidden_analysis?.problem_severity || 'Normal'}
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-blue-500" size={20} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Col: AI Insights (Summary of latest) */}
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl">
                <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4">{messages.customerStatusTitle}</h3>
                <div className="text-5xl font-black mb-2">{customer.lastSkinScore}</div>
                <div className="text-sm opacity-80 mb-6">{messages.customerLastScoreLabel}</div>
                
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
                        <span className="opacity-60">{messages.customerSkinTypeLabel}</span>
                        <span className="font-bold">{customer.lastSkinType || messages.customerSkinTypeUnknown}</span>
                    </div>
                     <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
                        <span className="opacity-60">{messages.customerActivityLabel}</span>
                        <span className="font-bold">{customer.totalCheckups} {messages.customerVisitsLabel}</span>
                    </div>
                </div>
            </div>
            
            <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100">
                <h3 className="text-amber-900 font-bold mb-2 flex items-center gap-2">
                    <MoreHorizontal size={20} />
                    {messages.customerRetentionStrategyTitle}
                </h3>
                <p className="text-sm text-amber-800 leading-relaxed">
                    {isDue
                        ? messages.customerRetentionDueText
                        : nextCheckup
                            ? messages.customerRetentionNextText(formatShortDate(nextCheckup, locale))
                            : messages.customerRetentionDefaultText
                    }
                </p>
            </div>
        </div>

      </div>

      {selectedLead && (
          <LeadDetailsModal lead={selectedLead} onClose={() => setSelectedLead(null)} />
      )}
    </div>
  )
}

function getScoreColor(score?: number) {
    if (!score) return 'bg-slate-100 text-slate-400';
    if (score >= 85) return 'bg-emerald-100 text-emerald-700';
    if (score >= 60) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
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
