'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Save, Globe, Check, Loader2, Info, Palette, MessageSquare, Sparkles, Plus, Trash2, Import, FileText, Link as LinkIcon, X, ArrowLeft, QrCode, Download, ExternalLink, RefreshCw, AlertTriangle, Layers } from 'lucide-react'
import { getClinicSettings, saveClinicSettings, ClinicSettings, ClinicService } from '@/lib/diagnostic/dashboardService'
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from '@/lib/i18n'
import { useRouter } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '@/lib/auth/AuthContext'
import SocialContentManager from './social-content/SocialContentManager'
import { auth } from '@/lib/diagnostic/firebaseConfig'
import { getMessages } from '@/lib/i18n/messages'
import Link from 'next/link'

interface ClinicSettingsFormProps {
    clinicId: string;
    isAdminMode?: boolean;
}

export default function ClinicSettingsForm({ clinicId, isAdminMode = false }: ClinicSettingsFormProps) {
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  
  const [settings, setSettings] = useState<ClinicSettings>({
    name: '',
    slug: clinicId,
    customDomain: '',
    isCustomDomainActive: false,
    defaultCountry: 'AE',
    defaultLocale: 'en-US',
    supportedLocales: ['en-US'],
    leadUnlockMethod: 'phone',
    primaryContactChannel: 'whatsapp',
    whatsappNumber: '',
    contactPhone: '',
    theme: { primaryColor: '#0f172a' },
    customSystemPrompt: '',
    services: []
  })
  
  // Local state for the website URL input (separate from settings until saved or used)
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [isDeepScan, setIsDeepScan] = useState(false)

  const locale: Locale = isSupportedLocale(settings.defaultLocale) ? settings.defaultLocale : DEFAULT_LOCALE
  const messages = getMessages(locale)
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [dnsStatus, setDnsStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  // Service Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [isScanningSite, setIsScanningSite] = useState(false)
  const [scanStatus, setScanStatus] = useState('')
  
  // New Service State
  const [newService, setNewService] = useState<ClinicService>({ name: '', price: '' })

  // Toast State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  
  // Dirty State Tracking
  const [initialSettings, setInitialSettings] = useState<ClinicSettings | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])
  
  // Check for unsaved changes
  useEffect(() => {
      if (!initialSettings) return
      const currentJson = JSON.stringify(settings)
      const initialJson = JSON.stringify(initialSettings)
      setIsDirty(currentJson !== initialJson)
  }, [settings, initialSettings])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    async function load() {
      if (!clinicId) return
      try {
        const data = await getClinicSettings(clinicId)
        if (data) {
          setSettings(data)
          setInitialSettings(data)
          // If the clinic has a saved website, populate the local input
          if ((data as any).website) {
             setWebsiteUrl((data as any).website)
          }
        } else {
          // Defaults
                    const defaults: ClinicSettings = { 
                        name: clinicId, 
                        slug: clinicId, 
                        customDomain: '',
                        isCustomDomainActive: false,
                        defaultCountry: 'AE',
                        defaultLocale: 'en-US',
                        supportedLocales: ['en-US'],
              leadUnlockMethod: 'phone',
              primaryContactChannel: 'whatsapp',
              whatsappNumber: '',
              contactPhone: '',
              theme: { primaryColor: '#0f172a' },
              customSystemPrompt: '',
              services: []
          }
          setSettings(defaults)
          setInitialSettings(defaults)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [clinicId])

  const handleSave = async () => {
    setSaving(true)
    setToast(null)
    try {
      // 1. If Slug changed, must use Secure API to reserve it
      if (settings.slug !== initialSettings?.slug) {
          const idToken = await auth.currentUser?.getIdToken();
          if (!idToken) throw new Error('Auth token missing');

          const res = await fetch('/api/reserve-slug', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${idToken}`
              },
              body: JSON.stringify({ slug: settings.slug, name: settings.name })
          });

	          if (!res.ok) {
	              const data = await res.json();
	              throw new Error(data.error || messages.clinicSettingsSlugReserveError);
	          }
	          console.log('✅ Slug reserved successfully');
	      }

      // 2. Save remaining settings to Firestore
      // Mix in the websiteUrl if present
      const settingsToSave = {
        ...settings,
        website: websiteUrl 
      }
      await saveClinicSettings(clinicId, settingsToSave)
      
      // 3. If Custom Domain changed, register in Vercel
      if (settings.isCustomDomainActive && settings.customDomain && settings.customDomain !== initialSettings?.customDomain) {
          try {
              const idToken = await user?.getIdToken();
              const res = await fetch('/api/admin/manage-domain', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${idToken}`
                  },
                  body: JSON.stringify({ domain: settings.customDomain })
              })
              const data = await res.json()
              if (!res.ok) {
                  if (data.configured === false) {
                       console.warn('Vercel API not configured, skipping automation')
                  } else {
                       throw new Error(data.error || 'Failed to register domain')
                  }
              }
	          } catch (domainError) {
	              console.error("Domain registration warning:", domainError)
	              // We don't block the UI, just warn
	              setToast({ message: messages.clinicSettingsDomainAutoRegisterFailed, type: 'error' })
	              setSaving(false)
	              return
	          }
	      }
	      
	      setInitialSettings(settings) // Update initial state to match current
	      setToast({ message: messages.clinicSettingsSaved, type: 'success' })
	    } catch (e) {
	      setToast({ message: messages.clinicSettingsSaveError, type: 'error' })
	    } finally {
	      setSaving(false)
	    }
	  }

  const checkDNS = () => {
    if (!settings.customDomain) return
    setVerifying(true)
    setDnsStatus('idle')
    
    // Simulation of DNS check
    setTimeout(() => {
      setVerifying(false)
      setDnsStatus('success') // Simulate success
    }, 2500)
  }
  
  const handleAddService = () => {
      if (!newService.name || !newService.price) return
      setSettings(prev => ({
          ...prev,
          services: [...(prev.services || []), newService]
      }))
      setNewService({ name: '', price: '' })
  }
  
  const handleDeleteService = (index: number) => {
      setSettings(prev => ({
          ...prev,
          services: prev.services?.filter((_, i) => i !== index)
      }))
  }
  
  const handleScanWebsite = async () => {
      if (!websiteUrl || !user) return
      setIsScanningSite(true)
      setScanStatus('Initiating scan...')
      try {
          const token = await user.getIdToken();
          const res = await fetch('/api/onboarding/process-website', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ 
                  websiteUrl, 
                  clinicId,
                  mode: isDeepScan ? 'crawl' : 'scrape'
              })
          });
          
          if (!res.ok) {
              const errData = await res.json();
              throw new Error(errData.error || 'Failed to scan website');
          }

          const data = await res.json();

          // Handle Deep Scan (Crawl)
          if (data.mode === 'crawl' && data.jobId) {
              setScanStatus('Deep scan started. This may take 1-2 minutes...');
              
              // Poll for status
              const pollInterval = setInterval(async () => {
                  try {
                      const statusRes = await fetch(`/api/onboarding/crawl-status?jobId=${data.jobId}&clinicId=${clinicId}`, {
                          headers: { 'Authorization': `Bearer ${token}` }
                      });
                      const statusData = await statusRes.json();

                      if (statusData.status === 'completed') {
                          clearInterval(pollInterval);
                          setScanStatus('Completed!');
                          
                          // Re-fetch settings
                          const updatedSettings = await getClinicSettings(clinicId);
                          if (updatedSettings && Array.isArray(updatedSettings.services)) {
                              setSettings(prev => ({ ...prev, services: updatedSettings.services }));
                              setToast({ message: `Successfully imported ${updatedSettings.services.length} services!`, type: 'success' });
                          }
                          setIsScanningSite(false);
                      } else if (statusData.status === 'failed') {
                          clearInterval(pollInterval);
                          throw new Error(statusData.error || 'Crawl failed');
                      } else {
                          // Still active
                          setScanStatus(`Scanning... ${statusData.current || 0} pages found`);
                      }
                  } catch (pollError: any) {
                      clearInterval(pollInterval);
                      console.error('Polling error:', pollError);
                      setToast({ message: pollError.message || 'Polling failed', type: 'error' });
                      setIsScanningSite(false);
                  }
              }, 3000); // Poll every 3 seconds

              return; // Exit handleScanWebsite, polling takes over
          }
          
          // Handle Single Page Scrape (Standard)
          setScanStatus('Finalizing...');
          const updatedSettings = await getClinicSettings(clinicId)
          
          if (updatedSettings && Array.isArray(updatedSettings.services)) {
             setSettings(prev => ({
                 ...prev,
                 services: updatedSettings.services
             }))
             setToast({ message: `Successfully imported ${updatedSettings.services.length} services!`, type: 'success' })
          } else {
              setToast({ message: 'Website scanned, but no services were extracted. Try Deep Scan or add manually.', type: 'error' });
          }

      } catch (e: any) {
          console.error(e)
          setToast({ message: e.message || 'Scan failed', type: 'error' })
          setIsScanningSite(false)
      } finally {
          // Only stop loading if we're not polling
          if (!isDeepScan) {
              setIsScanningSite(false)
          }
      }
  }
  
  const handleParsePrice = async () => {
      if (!importText) return
      setIsParsing(true)
      try {
          const idToken = await user?.getIdToken();
          const res = await fetch('/api/parse-price', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${idToken}`
              },
              body: JSON.stringify({ text: importText })
          })
          const data = await res.json()
	          if (data.services) {
	              setSettings(prev => ({
	                  ...prev,
	                  services: [...(prev.services || []), ...data.services]
	              }))
	              setIsImportModalOpen(false)
	              setImportText('')
	              setToast({ message: messages.clinicSettingsServicesImported, type: 'success' })
	          } else {
	              setToast({ message: messages.clinicSettingsServicesNotFound, type: 'error' })
	          }
	      } catch (e) {
	          setToast({ message: messages.clinicSettingsParseError, type: 'error' })
	      } finally {
	          setIsParsing(false)
	      }
	  }

  const handleDownloadQr = () => {
      const svg = document.getElementById("clinic-qr");
      if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();
          img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              if (ctx) {
                  ctx.fillStyle = 'white';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0);
              }
              const pngFile = canvas.toDataURL("image/png");
              const downloadLink = document.createElement("a");
              downloadLink.download = `${settings.slug}-qr.png`;
              downloadLink.href = `${pngFile}`;
              downloadLink.click();
          };
          img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      }
  }

	  if (loading) return <div className="p-12 text-center text-gray-500">{messages.clinicSettingsLoading}</div>

  return (
    <div className="max-w-4xl relative pb-24 mx-auto">
	      {isAdminMode && (
	          <button
	            onClick={() => router.back()}
	            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
	          >
	              <ArrowLeft size={18} /> {messages.clinicSettingsBackToClinics}
	          </button>
	      )}

      {/* General Settings */}
	      <div className="rounded-xl shadow-sm border border-gray-200 p-8 mb-8 bg-white">
	         <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600">
                A
            </div>
	            {messages.clinicSettingsSectionGeneral}
	         </h3>

         <div className="grid gap-6">
	            <div>
	                <label className="block text-sm font-medium mb-1 text-gray-700">{messages.clinicSettingsLabelClinicName}</label>
	                <input
	                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Epilux Clinic"
                    value={settings.name}
                    onChange={e => setSettings({...settings, name: e.target.value})}
                />
            </div>

	            <div>
	                <label className="block text-sm font-medium mb-1 text-gray-700">{messages.clinicSettingsLabelClinicSlug}</label>
	                <div className="flex items-center gap-2">
                    <div className="flex-grow flex items-center">
                        <input
                            type="text"
                            className="w-full px-4 py-3 border border-gray-200 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono bg-gray-50 text-gray-900"
                            value={settings.slug}
                            onChange={e => setSettings({...settings, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                        />
                        <div className="px-4 py-3 border border-l-0 border-gray-200 rounded-r-xl text-sm font-mono bg-gray-100 text-gray-500">
                            .curescan.pro
                        </div>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* Contacts Settings */}
      <div className="rounded-xl shadow-sm border border-gray-200 p-8 mb-8 bg-white">
        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-50 text-emerald-600">
            <MessageSquare size={18} />
          </div>
          Contacts
        </h3>

        <div className="grid gap-6">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">WhatsApp number (E.164)</label>
            <div id="whatsapp" className="scroll-mt-24" />
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              placeholder="+971501234567"
              value={settings.whatsappNumber || ''}
              onChange={(e) => setSettings({ 
                ...settings, 
                whatsappNumber: e.target.value,
                primaryContactChannel: 'whatsapp',
                leadUnlockMethod: 'phone'
              })}
            />
            <p className="text-xs text-gray-500 mt-1">Used to open `wa.me` for patient consultations and offers.</p>
          </div>
        </div>
      </div>
      
      {/* Price List / Services Configuration - NEW CARD */}
      <div className="rounded-xl shadow-sm border border-gray-200 p-8 mb-8 bg-white" id="services">
         <div className="flex justify-between items-start mb-6">
            <h3 className="text-xl font-bold flex items-center gap-3 text-gray-900">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600 shadow-sm">
                    <FileText size={22} />
                </div>
                <div>
                    <div>{messages.clinicSettingsLabelPriceList}</div>
                    <div className="text-xs font-normal text-gray-500 mt-1">
                        AI recommends treatments only from this list.
                    </div>
                </div>
            </h3>
            
            <div className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold border border-purple-100">
                {settings.services?.length || 0} services
            </div>
         </div>

         {/* Website Automation Block */}
         <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-xl">
             <label className="block text-sm font-bold text-gray-900 mb-2">
                Auto-Update from Website
             </label>
             <p className="text-sm text-gray-500 mb-4">
                Enter your website URL. We will scan it and automatically extract your services and prices.
             </p>
             
             <div className="flex flex-col md:flex-row gap-3">
                 <div className="flex-grow relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                        <Globe size={20} />
                    </div>
                    <input 
                        type="url"
                        placeholder="https://myclinic.com/services"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                        value={websiteUrl}
                        onChange={e => setWebsiteUrl(e.target.value)}
                    />
                 </div>
                 <button 
                    onClick={handleScanWebsite}
                    disabled={isScanningSite || !websiteUrl}
                    className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:shadow-none whitespace-nowrap"
                 >
                    {isScanningSite ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    <span>{isScanningSite ? 'Scanning...' : 'Scan & Import'}</span>
                 </button>
             </div>
             
             <div className="flex items-center gap-2 mt-3 ml-1">
                 <label className="flex items-center gap-2 text-sm text-gray-700 font-medium cursor-pointer select-none">
                     <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        checked={isDeepScan}
                        onChange={e => setIsDeepScan(e.target.checked)}
                     />
                     <div className="flex items-center gap-1.5">
                         <Layers size={14} className="text-purple-500" />
                         <span>Deep Scan (multi-page)</span>
                     </div>
                 </label>
                 <span className="text-xs text-gray-400 border-l border-gray-200 pl-2">
                     Slower (~1 min), but finds hidden menus.
                 </span>
             </div>

             <p className="text-xs text-gray-500 mt-2 ml-1">
                💡 <strong>Tip:</strong> Paste the direct link to your <u>Services</u> or <u>Price List</u> page (e.g. <em>/services</em>) to get a detailed list of procedures instead of just categories.
             </p>
             {isScanningSite && (
                 <p className="text-xs text-purple-600 mt-2 animate-pulse font-medium">
                     {scanStatus || 'Analysis in progress... This may take up to 20 seconds.'}
                 </p>
             )}
         </div>

         {/* Manual Editor */}
         <div className="space-y-4">
             <div className="flex justify-between items-center">
                 <h4 className="font-bold text-gray-700 text-sm">Manual Editing</h4>
                 <div className="flex gap-3">
                     {settings.services && settings.services.length > 0 && (
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete ALL services?')) {
                                    setSettings(prev => ({ ...prev, services: [] }));
                                }
                            }}
                            className="text-red-500 text-xs hover:text-red-700 flex items-center gap-1 transition-colors font-medium px-2 py-1 rounded hover:bg-red-50"
                        >
                            <Trash2 size={14} /> Clear All
                        </button>
                     )}
                     <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="text-gray-500 text-xs hover:text-purple-600 flex items-center gap-1 transition-colors font-medium px-2 py-1 rounded hover:bg-purple-50"
                    >
                        <Import size={14} /> Paste Text
                    </button>
                 </div>
             </div>
             
             {/* Add New Service Inline */}
             <div className="flex gap-2 p-2 rounded-xl border border-gray-200 bg-white">
                 <input
                    placeholder="Service Name (e.g. Botox)"
                    className="flex-grow px-3 py-2 rounded-lg border border-gray-100 text-sm focus:outline-none focus:border-purple-500 bg-gray-50"
                    value={newService.name}
                    onChange={e => setNewService({...newService, name: e.target.value})}
                 />
                 <input
                    placeholder="Price (e.g. 300 AED)"
                    className="w-32 px-3 py-2 rounded-lg border border-gray-100 text-sm focus:outline-none focus:border-purple-500 bg-gray-50"
                    value={newService.price}
                    onChange={e => setNewService({...newService, price: e.target.value})}
                 />
                 <button
                    onClick={handleAddService}
                    className="bg-gray-900 hover:bg-gray-800 text-white p-2 rounded-lg transition-colors shadow-sm"
                 >
                     <Plus size={18} />
                 </button>
             </div>

             {/* List */}
             <div className="border border-gray-200 rounded-xl overflow-hidden max-h-80 overflow-y-auto bg-white">
                 {settings.services && settings.services.length > 0 ? (
                     <table className="w-full text-sm text-left">
                         <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase">
                             <tr>
                                 <th className="px-4 py-3">Service Name</th>
                                 <th className="px-4 py-3">Price</th>
                                 <th className="px-4 py-3 text-right">Action</th>
                             </tr>
                         </thead>
                         <tbody className="divide-y divide-gray-100">
                             {settings.services.map((svc, i) => (
                                 <tr key={`${i}-${svc.name}`} className="hover:bg-gray-50 transition-colors">
                                     <td className="px-4 py-3 text-gray-900 font-medium">{svc.name}</td>
                                     <td className="px-4 py-3 text-gray-600">{svc.price}</td>
                                     <td className="px-4 py-3 text-right">
                                         <button onClick={() => handleDeleteService(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                                             <Trash2 size={16} />
                                         </button>
                                     </td>
                                 </tr>
                             ))}
                         </tbody>
                     </table>
	                 ) : (
	                     <div className="p-12 text-center text-gray-400 text-sm flex flex-col items-center">
                             <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                <FileText size={24} className="opacity-50" />
                             </div>
	                         No services added yet. Scan your website or add manually.
	                     </div>
	                 )}
	             </div>
	         </div>
      </div>
      
      {/* Custom Instructions - SEPARATE CARD */}
      <div className="rounded-xl shadow-sm border border-gray-200 p-8 mb-8 bg-white">
         <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600">
                <MessageSquare size={18} />
            </div>
            {messages.clinicSettingsLabelCustomPrompt}
         </h3>
         
         <div className="mb-2 p-4 bg-indigo-50 rounded-lg text-sm text-indigo-800 border border-indigo-100 flex gap-3">
             <Info className="shrink-0 mt-0.5" size={16} />
             <div>
                 <strong>Advanced Mode:</strong> You can give the AI specific instructions about your clinic's tone of voice, upsell strategy, or specific contraindications.
             </div>
         </div>

         <div className="relative">
            <textarea
                className="w-full h-40 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm leading-relaxed font-mono"
                placeholder={messages.clinicSettingsPlaceholderCustomPrompt}
                value={settings.customSystemPrompt || ''}
                maxLength={2000}
                onChange={e => setSettings({...settings, customSystemPrompt: e.target.value})}
            />
            <div className="absolute bottom-3 right-3 text-[10px] text-gray-400 bg-white/80 px-2 py-1 rounded-md border border-gray-100">
                {(settings.customSystemPrompt || '').length}/2000
            </div>
         </div>
      </div>

      {/* Branding Settings */}
	      <div className="rounded-xl shadow-sm border border-gray-200 p-8 mb-8 bg-white">
         <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-pink-50 text-pink-600">
                <Palette size={18} />
            </div>
	            {messages.clinicSettingsSectionBranding}
	         </h3>

         <div className="flex items-center gap-6">
	            <div className="flex-1">
	                <label className="block text-sm font-medium mb-2 text-gray-700">{messages.clinicSettingsLabelPrimaryColor}</label>
	                <div className="flex items-center gap-3">
                    <input
                        type="color"
                        className="w-12 h-12 rounded-lg cursor-pointer border-0 p-0"
                        value={settings.theme?.primaryColor || '#0f172a'}
                        onChange={e => setSettings({...settings, theme: { ...settings.theme, primaryColor: e.target.value }})}
                    />
                    <input
                        type="text"
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none font-mono uppercase w-32"
                        value={settings.theme?.primaryColor || '#0f172a'}
                        onChange={e => setSettings({...settings, theme: { ...settings.theme, primaryColor: e.target.value }})}
                    />
                </div>
            </div>
         </div>
      </div>
      
      {/* Social Content Proof */}
      <div className="rounded-xl shadow-sm border border-gray-200 p-8 mb-8 bg-white">
        <SocialContentManager clinicId={clinicId} />
      </div>

      {/* QR Code / Entry Point */}
      <div className="rounded-xl shadow-sm border border-gray-200 p-8 mb-8 bg-white">
         <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-600">
                <QrCode size={18} />
            </div>
	            {messages.clinicSettingsSectionEntryPoint}
	         </h3>

         <div className="flex flex-col md:flex-row gap-8 items-start">
             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
                 <QRCodeSVG 
                    id="clinic-qr"
                    value={`https://${settings.isCustomDomainActive && settings.customDomain ? settings.customDomain : `${settings.slug}.curescan.pro`}`} 
                    size={180}
                    level="H"
                    includeMargin={true}
                 />
             </div>
             
	             <div className="flex-1">
	                 <h4 className="font-bold text-gray-900 mb-2">{messages.clinicSettingsQrTitle}</h4>
	                 <p className="text-sm text-gray-600 mb-4">{messages.clinicSettingsQrDescription}</p>
                     
                     {/* WARNING BOX */}
                     <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex gap-3 text-sm text-yellow-800">
                         <AlertTriangle className="shrink-0" size={18} />
                         <div>
                             <strong className="block mb-1 font-semibold">Direct QR Code (No Tracking)</strong>
                             This is a generic entry point. To track ROI, ads, and specific campaigns, please create unique tracking links in the <Link href="/dashboard/sources" className="underline font-bold hover:text-yellow-900">Sources</Link> tab.
                         </div>
                     </div>
	                 
	                 <div className="flex flex-wrap gap-3">
	                     <button
	                        onClick={handleDownloadQr}
	                        className="px-5 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm"
	                     >
	                         <Download size={16} /> {messages.clinicSettingsDownloadPng}
	                     </button>
	                     
	                     <a 
	                        href={`https://${settings.isCustomDomainActive && settings.customDomain ? settings.customDomain : `${settings.slug}.curescan.pro`}`} 
	                        target="_blank"
	                        className="px-5 py-2.5 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
	                     >
	                         <ExternalLink size={16} /> {messages.clinicSettingsOpenLink}
	                     </a>
	                 </div>
	             </div>
	         </div>
	      </div>

      {/* Import Modal */}
	      {isImportModalOpen && mounted && createPortal(
	          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
	              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
	                  <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
	                      <h3 className="font-bold text-xl text-slate-900">{messages.clinicSettingsImportModalTitle}</h3>
	                      <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
	                          <X size={24} />
	                      </button>
	                  </div>
	                  <div className="p-6">
	                      <textarea 
	                          className="w-full h-48 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono text-sm leading-relaxed mb-6"
	                          placeholder={messages.clinicSettingsImportModalPlaceholder}
	                          value={importText}
	                          maxLength={5000}
	                          onChange={e => setImportText(e.target.value)}
	                      />
	                      <div className="flex justify-end gap-3">
	                          <button 
	                            onClick={() => setIsImportModalOpen(false)}
	                            className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
	                          >
	                              {messages.clinicSettingsCancel}
	                          </button>
	                          <button 
	                            onClick={handleParsePrice}
	                            disabled={isParsing || !importText}
	                            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-200 disabled:opacity-70"
	                          >
	                             {isParsing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
	                             <span>{messages.clinicSettingsDetectPrices}</span>
	                          </button>
	                      </div>
	                  </div>
	              </div>
	          </div>,
	          document.body
	      )}
      
      {/* Language & Region - Bottom Section */}
      <div className="rounded-xl shadow-sm border border-gray-100 p-8 mb-8 bg-slate-50/50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-500">
          <Globe size={18} />
          Language & Region
        </h3>
        <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2 text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                <span className="font-bold">Country:</span>
                <span>United Arab Emirates (AE)</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
                <span className="font-bold">Default Language:</span>
                <span>English (en-US)</span>
            </div>
        </div>
        <p className="mt-4 text-xs text-gray-400">
            Localized settings are locked to UAE defaults for the pilot phase. For additional languages (Arabic), please contact support.
        </p>
      </div>

      {/* Floating Save Bar */}
	      {mounted && createPortal(
	            <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isDirty ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
	                <div className="bg-white text-gray-900 p-2 pl-6 pr-2 rounded-full shadow-2xl flex items-center gap-4 border border-gray-200">
	                    <span className="text-sm font-medium">{messages.clinicSettingsUnsavedChanges}</span>
	                    <button
	                        onClick={handleSave}
	                        disabled={saving}
	                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
	                    >
                        <div className="relative w-4 h-4">
                            <Loader2 size={16} className={`animate-spin absolute inset-0 transition-opacity ${saving ? 'opacity-100' : 'opacity-0'}`} />
                            <Save size={16} className={`absolute inset-0 transition-opacity ${saving ? 'opacity-0' : 'opacity-100'}`} />
	                        </div>
	                        {messages.clinicSettingsSave}
	                    </button>
	                </div>
	            </div>,
	        document.body
	      )}
    </div>
  )
}
