'use client'

import React, { useEffect, useState } from 'react'
import { Webhook, Save, CheckCircle, AlertTriangle, ExternalLink, Activity } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { getClinicSettings, saveClinicSettings, ClinicSettings } from '@/lib/diagnostic/dashboardService'
import { useDashboardI18n } from '@/lib/i18n/dashboard'

export default function IntegrationsPage() {
  const { user } = useAuth()
  const { messages } = useDashboardI18n()
  const clinicId = user?.uid || 'default'
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<ClinicSettings | null>(null)
  
  const [webhookUrl, setWebhookUrl] = useState('')
  
  // YCLIENTS State
  const [ycActive, setYcActive] = useState(false)
  const [ycId, setYcId] = useState('')
  const [ycToken, setYcToken] = useState('')

  // HubSpot State
  const [hsActive, setHsActive] = useState(false)
  const [hsToken, setHsToken] = useState('')

  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function load() {
        if (!user) return
        try {
            const data = await getClinicSettings(clinicId)
            setSettings(data)
            // @ts-ignore
            setWebhookUrl(data?.integrations?.webhook_url || '')
            // @ts-ignore
            setYcActive(data?.integrations?.yclients?.active || false)
            // @ts-ignore
            setYcId(data?.integrations?.yclients?.company_id || '')
            // @ts-ignore
            setYcToken(data?.integrations?.yclients?.token || '')
            
            // @ts-ignore
            setHsActive(data?.integrations?.hubspot?.active || false)
            // @ts-ignore
            setHsToken(data?.integrations?.hubspot?.access_token || '')

        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }
    load()
  }, [user, clinicId])

  const handleSave = async () => {
      setIsSaving(true)
      try {
          // Construct updates
          const updates = {
              integrations: {
                  webhook_url: webhookUrl.trim(),
                  yclients: {
                      active: ycActive,
                      company_id: ycId.trim(),
                      token: ycToken.trim()
                  },
                  hubspot: {
                      active: hsActive,
                      access_token: hsToken.trim()
                  }
              }
          }
          
          // @ts-ignore
          await saveClinicSettings(clinicId, updates)
          setSuccessMsg(messages.integrationsSuccessMessage)
          setTimeout(() => setSuccessMsg(''), 3000)
      } catch (e) {
          alert(messages.integrationsSaveError)
      } finally {
          setIsSaving(false)
      }
  }

  if (loading) return <div className="p-12 text-center text-slate-400">{messages.integrationsLoading}</div>

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      <div className="flex justify-between items-center mb-8">
	        <div>
	            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{messages.integrationsPageTitle}</h2>
	            <p className="text-slate-500">{messages.integrationsPageSubtitle}</p>
	        </div>
        <button 
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 disabled:opacity-70 shadow-lg shadow-slate-200"
	        >
	            {isSaving ? <Activity className="animate-spin" size={18} /> : <Save size={18} />}
	            {messages.integrationsSaveButton}
	        </button>
      </div>
      
      {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <CheckCircle size={18} /> {successMsg}
          </div>
      )}

      {/* WEBHOOK CARD */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-8">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                      <Webhook size={32} />
                  </div>
                  <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Universal Webhook</h3>
                      <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">
                          {messages.integrationsWebhookDescription}
                      </p>
                  </div>
              </div>
          </div>
          
          <div className="p-8">
              <label className="block text-sm font-bold text-slate-700 mb-3">{messages.integrationsWebhookLabel}</label>
              <input 
                  type="url" 
                  placeholder={messages.integrationsWebhookPlaceholder}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
              />
          </div>
      </div>

      {/* NATIVE INTEGRATIONS GRID */}
      <h3 className="text-lg font-bold text-slate-900 mb-4 px-2">Native CRM</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* YCLIENTS */}
          <div className={`rounded-3xl border transition-all ${ycActive ? 'bg-white border-yellow-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-90'}`}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#FFCC00] rounded-lg flex items-center justify-center font-bold text-slate-900 text-lg">Y</div>
                      <h4 className="font-bold text-slate-900">YCLIENTS</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={ycActive} onChange={e => setYcActive(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-400"></div>
                  </label>
              </div>
              <div className="p-6 space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">{messages.integrationsYclientsCompanyLabel}</label>
                      <input 
                          type="text" 
                          placeholder={messages.integrationsYclientsCompanyPlaceholder}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400"
                          value={ycId}
                          onChange={e => setYcId(e.target.value)}
                          disabled={!ycActive}
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">{messages.integrationsYclientsTokenLabel}</label>
                      <input 
                          type="password" 
                          placeholder={messages.integrationsYclientsTokenPlaceholder}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-yellow-400"
                          value={ycToken}
                          onChange={e => setYcToken(e.target.value)}
                          disabled={!ycActive}
                      />
                  </div>
              </div>
          </div>

          {/* HUBSPOT */}
          <div className={`rounded-3xl border transition-all ${hsActive ? 'bg-white border-orange-200 shadow-sm' : 'bg-slate-50 border-slate-200 opacity-90'}`}>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#ff5c35] rounded-lg flex items-center justify-center font-bold text-white text-lg">H</div>
                      <h4 className="font-bold text-slate-900">HubSpot</h4>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={hsActive} onChange={e => setHsActive(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ff5c35]"></div>
                  </label>
              </div>
              <div className="p-6 space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">{messages.integrationsHubspotTokenLabel}</label>
                      <input 
                          type="password" 
                          placeholder={messages.integrationsHubspotTokenPlaceholder}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#ff5c35]"
                          value={hsToken}
                          onChange={e => setHsToken(e.target.value)}
                          disabled={!hsActive}
                      />
                      <p className="text-[10px] text-slate-400 mt-1">{messages.integrationsHubspotTokenHint}</p>
                  </div>
              </div>
          </div>

      </div>

    </div>
  )
}
