'use client'

import React, { useEffect, useState } from 'react'
import { Plus, Trash2, Copy, Check, QrCode, ExternalLink, Globe, Search, Instagram, Share2, MapPin, Download } from 'lucide-react'
import { createSource, getClinicSettings, getSources, deleteSource, TrafficSource } from '@/lib/diagnostic/dashboardService'
import { useAuth } from '@/lib/auth/AuthContext'
import { QRCodeSVG } from 'qrcode.react'
import { useDashboardI18n } from '@/lib/i18n/dashboard'

export default function SourcesPage() {
  const { user } = useAuth()
  const { messages } = useDashboardI18n()
  const clinicId = user?.uid || 'default'

  const [sources, setSources] = useState<TrafficSource[]>([])
  const [loading, setLoading] = useState(true)
  const [clinicSlug, setClinicSlug] = useState<string | null>(null)

  // New Source Form
  const [isCreating, setIsCreating] = useState(false)
  const [newSourceType, setNewSourceType] = useState('instagram')
  const [newSourceName, setNewSourceName] = useState('')
  const [newSourceContent, setNewSourceContent] = useState('') // For utm_content (e.g. "variant_a")

  // Copy Feedback
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    loadSources()
  }, [user, clinicId])

  useEffect(() => {
    const loadClinic = async () => {
      if (!user || clinicId === 'default') return
      try {
        const settings = await getClinicSettings(clinicId)
        if (settings?.slug) setClinicSlug(settings.slug)
      } catch (e) {
        console.error('Failed to load clinic settings:', e)
      }
    }
    loadClinic()
  }, [user, clinicId])

  const trafficSources = [
    {
      groupLabel: messages.sourcesDigitalAdsGroup,
      options: [
        { id: "meta_ads", label: "Meta Ads (FB/IG)", icon: "🎯" },
        { id: "google_ads", label: "Google Ads", icon: "🔍" },
        { id: "yandex_direct", label: "Yandex Direct", icon: "🔴" },
        { id: "tiktok_ads", label: "TikTok Ads", icon: "🎵" },
        { id: "snapchat_ads", label: "Snapchat Ads", icon: "👻" },
      ]
    },
    {
      groupLabel: messages.sourcesSocialGroup,
      options: [
        { id: "instagram", label: "Instagram (Bio/Stories)", icon: "📸" },
        { id: "telegram", label: "Telegram Channel", icon: "✈️" },
        { id: "tiktok_org", label: "TikTok (Organic)", icon: "🎥" },
        { id: "whatsapp", label: "WhatsApp Marketing", icon: "💬" },
        { id: "influencer", label: messages.sourcesOptionInfluencer, icon: "🤳" },
      ]
    },
    {
      groupLabel: messages.sourcesLocalGroup,
      options: [
        { id: "google_maps", label: "Google Maps", icon: "📍" },
        { id: "yandex_maps", label: "Yandex Maps / 2GIS", icon: "🗺️" },
        { id: "apple_maps", label: "Apple Maps", icon: "🍏" },
      ]
    },
    {
      groupLabel: messages.sourcesOfflineGroup,
      options: [
        { id: "qr_reception", label: messages.sourcesOptionQrReception, icon: "🏥" },
        { id: "qr_outdoor", label: messages.sourcesOptionQrOutdoor, icon: "🏙️" },
        { id: "print", label: messages.sourcesOptionPrint, icon: "📄" },
        { id: "partner", label: messages.sourcesOptionPartner, icon: "🤝" },
      ]
    },
    {
      groupLabel: messages.sourcesOtherGroup,
      options: [
        { id: "website", label: messages.sourcesOptionWebsite, icon: "🌐" },
        { id: "other", label: messages.sourcesOptionOther, icon: "🔗" },
      ]
    }
  ]

  async function loadSources() {
    if (!user) return
    try {
        const data = await getSources(clinicId)
        // Sort by creation date desc
        setSources(data.sort((a, b) => b.createdAt - a.createdAt))
    } catch (e) {
        console.error(e)
    } finally {
        setLoading(false)
    }
  }

  const handleCreate = async () => {
      if (!newSourceName) return alert(messages.sourcesNameRequired)

      const baseUrl = window.location.origin
      // Construct UTM URL
      // Priority: 
      // utm_source = type (e.g. instagram)
      // utm_campaign = name (e.g. summer_promo) - this is what shows in Sankey
      // utm_content = variant (optional)
      
      const url = new URL(baseUrl)
      url.searchParams.set('utm_source', newSourceType)
      url.searchParams.set('utm_campaign', newSourceName.trim().replace(/\s+/g, '_'))
      if (newSourceContent) {
          url.searchParams.set('utm_content', newSourceContent.trim())
      }
      // Add client context (slug preferred; uid supported as a fallback)
      if (clinicId !== 'default') {
          url.searchParams.set('client', clinicSlug || clinicId)
      }

      try {
          await createSource({
              clinicId,
              name: newSourceName,
              type: newSourceType as any,
              utm_source: newSourceType,
              utm_campaign: newSourceName,
              utm_content: newSourceContent,
              url: url.toString()
          })
          setIsCreating(false)
          setNewSourceName('')
          setNewSourceContent('')
          setNewSourceType('instagram')
          loadSources()
      } catch (e) {
          console.error(e)
          alert(messages.sourcesCreateError)
      }
  }

  const handleDelete = async (id: string) => {
      if (!confirm(messages.sourcesArchiveConfirm)) return
      try {
          await deleteSource(id)
          setSources(sources.filter(s => s.id !== id))
      } catch (e) {
          console.error(e)
      }
  }

  const copyToClipboard = (text: string, id: string) => {
      navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
  }

  const handleDownloadQr = (sourceId: string, sourceName: string) => {
      const svg = document.getElementById(`qr-${sourceId}`);
      if (svg) {
          const svgData = new XMLSerializer().serializeToString(svg);
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const img = new Image();
          img.onload = () => {
              canvas.width = 1024; // High resolution
              canvas.height = 1024;
              if (ctx) {
                  ctx.fillStyle = 'white';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  // Draw QR in the center
                  const padding = 64;
                  const size = canvas.width - (padding * 2);
                  ctx.drawImage(img, padding, padding, size, size);
              }
              const pngFile = canvas.toDataURL("image/png");
              const downloadLink = document.createElement("a");
              downloadLink.download = `qr-${sourceName.toLowerCase().replace(/\s+/g, '_')}.png`;
              downloadLink.href = `${pngFile}`;
              downloadLink.click();
          };
          img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      }
  }

  const getSourceIcon = (type: string) => {
      for (const group of trafficSources) {
          const found = group.options.find(opt => opt.id === type)
          if (found) return found.icon
      }
      return '🔗'
  }

  const getSourceLabel = (type: string) => {
      for (const group of trafficSources) {
          const found = group.options.find(opt => opt.id === type)
          if (found) return found.label
      }
      return type
  }

  if (loading) return <div className="p-12 text-center text-slate-400">{messages.sourcesLoading}</div>

  return (
    <div className="pb-20 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{messages.sourcesPageTitle}</h2>
            <p className="text-slate-500">{messages.sourcesPageSubtitle}</p>
        </div>
        <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-95"
        >
            <Plus size={20} />
            {messages.sourcesCreateButton}
        </button>
      </div>

      {/* Creation Form Modal */}
      {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-slate-900">{messages.sourcesModalTitle}</h3>
                      <button onClick={() => setIsCreating(false)} className="text-slate-400 hover:text-slate-600">
                          <XIcon />
                      </button>
                  </div>

                  <div className="space-y-5">
                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">{messages.sourcesModalChannelLabel}</label>
                          <div className="relative">
                              <select
                                  value={newSourceType}
                                  onChange={(e) => setNewSourceType(e.target.value)}
                                  className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 pr-10 font-medium"
                              >
	                                  {trafficSources.map((group) => (
	                                      <optgroup key={group.groupLabel} label={group.groupLabel} className="font-bold text-slate-900">
	                                          {group.options.map((opt) => (
	                                              <option key={opt.id} value={opt.id}>
	                                                  {opt.icon} {opt.label}
	                                              </option>
	                                          ))}
	                                      </optgroup>
	                                  ))}
	                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                              </div>
                          </div>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">{messages.sourcesModalCampaignLabel}</label>
                          <input
                              type="text"
                              placeholder={messages.sourcesModalCampaignPlaceholder}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-medium"
                              value={newSourceName}
                              onChange={(e) => setNewSourceName(e.target.value)}
                          />
                          <p className="mt-1 text-[10px] text-slate-400">{messages.sourcesModalCampaignHint}</p>
                      </div>

                      <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">{messages.sourcesModalContentLabel}</label>
                          <input
                              type="text"
                              placeholder={messages.sourcesModalContentPlaceholder}
                              className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 font-medium"
                              value={newSourceContent}
                              onChange={(e) => setNewSourceContent(e.target.value)}
                          />
                      </div>

                      <button
                          onClick={handleCreate}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 mt-4"
                      >
                          <Plus size={18} /> {messages.sourcesModalCreateButton}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* Sources List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sources.map((source) => (
              <div key={source.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative overflow-hidden">
                  
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100">
                              {getSourceIcon(source.type)}
                          </div>
                          <div>
                              <h3 className="font-bold text-slate-900 text-base leading-tight">{source.name}</h3>
                              <p className="text-xs text-slate-400 font-medium mt-0.5">{getSourceLabel(source.type)}</p>
                          </div>
                      </div>
                      <button
                        onClick={() => source.id && handleDelete(source.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors p-2"
                        title={messages.sourcesCardArchiveTitle}
                      >
                          <Trash2 size={16} />
                      </button>
                  </div>

                  {/* QR & Link Area */}
                  <div className="bg-slate-50 rounded-2xl p-4 flex gap-4 items-center mb-4 border border-slate-100">
                      <button
                        onClick={() => handleDownloadQr(source.id!, source.name)}
                        className="bg-white p-2 rounded-xl shadow-sm hover:ring-2 hover:ring-blue-500 transition-all relative group/qr overflow-hidden"
                        title={messages.sourcesCardQrDownloadTitle}
                      >
                          <QRCodeSVG 
                            id={`qr-${source.id}`} 
                            value={source.url} 
                            size={64}
                            className="transition-all duration-300 group-hover/qr:blur-[1.5px] group-hover/qr:opacity-50" 
                          />
                          <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover/qr:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[0.5px]">
                              <Download size={20} className="text-blue-600 scale-75 group-hover/qr:scale-100 transition-transform duration-300" />
                          </div>
                      </button>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                              <input 
                                type="text" 
                                readOnly 
                                value={source.url} 
                                className="w-full bg-transparent text-[10px] text-slate-500 font-mono focus:outline-none truncate"
                              />
                          </div>
                          <div className="flex gap-2">
                              <button
                                onClick={() => copyToClipboard(source.url, source.id!)}
                                className={`flex-1 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                                    copiedId === source.id
                                    ? 'bg-green-500 text-white shadow-green-200'
                                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                                }`}
                              >
                                  {copiedId === source.id ? <Check size={14} /> : <Copy size={14} />}
                                  {copiedId === source.id ? messages.sourcesCardCopiedButton : messages.sourcesCardCopyButton}
                              </button>
                              <a 
                                href={source.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="p-2 bg-white text-slate-400 border border-slate-200 rounded-lg hover:text-blue-500 hover:border-blue-200 transition-colors"
                              >
                                  <ExternalLink size={14} />
                              </a>
                          </div>
                      </div>
                  </div>

                  {/* Stats (Mockup for now, real stats are in analytics page) */}
                  <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-1">
                      <span>{messages.sourcesCardCreatedLabel} {new Date(source.createdAt.seconds * 1000).toLocaleDateString()}</span>
                      {source.utm_content && (
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                              Content: {source.utm_content}
                          </span>
                      )}
                  </div>
                  
                  {/* Decoration */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-transparent rounded-bl-full -z-10 opacity-50"></div>
              </div>
          ))}
          
          {/* Empty State / Add Button */}
          <button
            onClick={() => setIsCreating(true)}
            className="rounded-3xl border-2 border-dashed border-slate-200 p-6 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/50 transition-all min-h-[220px] group"
          >
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform group-hover:bg-white group-hover:shadow-md text-slate-300 group-hover:text-blue-500">
                  <Plus size={32} />
              </div>
              <span className="font-bold">{messages.sourcesCreateButton}</span>
          </button>
      </div>
    </div>
  )
}

function XIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
    )
}
