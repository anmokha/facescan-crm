'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Trash2, ExternalLink, Star, Instagram, Loader2, Save, X, Globe, Sparkles, AlertCircle, Wand2 } from 'lucide-react'
import { SocialContent } from '@/lib/diagnostic/types'
import { ClinicSettings } from '@/lib/diagnostic/dashboardService'
import { useAuth } from '@/lib/auth/AuthContext'

interface SocialContentManagerProps {
  clinicId: string
}

export default function SocialContentManager({ clinicId }: SocialContentManagerProps) {
  const { user } = useAuth()
  const [content, setContent] = useState<SocialContent[]>([])
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [importingGoogle, setImportingGoogle] = useState(false)
  const [importingInsta, setImportingInsta] = useState(false)
  const [googleQuery, setGoogleQuery] = useState('')
  const [instaUrl, setInstaUrl] = useState('')

  useEffect(() => {
    fetchContent()
    fetchClinicSettings()
  }, [clinicId])

  async function fetchClinicSettings() {
    try {
      const { getClinicSettings } = await import('@/lib/diagnostic/dashboardService')
      const settings = await getClinicSettings(clinicId)
      if (settings) setClinicSettings(settings)
    } catch (e) {
      console.error('Failed to fetch clinic settings:', e)
    }
  }

  async function fetchContent() {
    setLoading(true)
    try {
      const token = await user?.getIdToken()
      const res = await fetch(`/api/admin/social-content?clinicId=${clinicId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setContent(data.content || [])
      }
    } catch (e) {
      console.error('Failed to fetch content:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure?')) return
    try {
      const token = await user?.getIdToken()
      const res = await fetch(`/api/admin/social-content/${id}?clinicId=${clinicId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) fetchContent()
    } catch (e) {
      console.error('Delete error:', e)
    }
  }

  const handleToggleActive = async (item: SocialContent) => {
    try {
      const token = await user?.getIdToken()
      await fetch(`/api/admin/social-content/${item.id}?clinicId=${clinicId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !item.isActive })
      })
      setContent(content.map(c => c.id === item.id ? { ...c, isActive: !c.isActive } : c))
    } catch (e) {
      console.error('Toggle error:', e)
    }
  }

  const handleGoogleImport = async () => {
    if (!googleQuery) return
    setImportingGoogle(true)
    try {
      const token = await user?.getIdToken()
      const res = await fetch('/api/admin/social-content/import-google', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clinicId, query: googleQuery })
      })
      
      if (res.ok) {
        const data = await res.json()
        const availableProcedures = clinicSettings?.services?.map(s => s.name) || []
        
        for (const review of data.reviews) {
          let keywords: string[] = []
          if (availableProcedures.length > 0) {
            const aiRes = await fetch('/api/ai/match-procedures', {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ text: review.text, availableProcedures })
            })
            if (aiRes.ok) {
              const aiData = await aiRes.json()
              keywords = aiData.matchedProcedures || []
            }
          }

          await fetch('/api/admin/social-content', {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              ...review, 
              clinicId, 
              procedureKeywords: keywords,
              isActive: true,
              order: content.length 
            })
          })
        }
        
        setGoogleQuery('')
        fetchContent()
      } else {
        const err = await res.json()
        alert(err.error || 'Google Import failed')
      }
    } catch (e) {
      console.error('Import error:', e)
    } finally {
      setImportingGoogle(false)
    }
  }

  const handleInstagramImport = async () => {
    if (!instaUrl) return
    setImportingInsta(true)
    try {
      const token = await user?.getIdToken()
      const res = await fetch('/api/admin/social-content/import-instagram', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ clinicId, url: instaUrl })
      })
      
      if (res.ok) {
        const data = await res.json()
        const availableProcedures = clinicSettings?.services?.map(s => s.name) || []
        
        let keywords: string[] = []
        if (availableProcedures.length > 0 && data.post.caption) {
            const aiRes = await fetch('/api/ai/match-procedures', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: data.post.caption, availableProcedures })
            })
            if (aiRes.ok) {
                const aiData = await aiRes.json()
                keywords = aiData.matchedProcedures || []
            }
        }

        await fetch('/api/admin/social-content', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                ...data.post, 
                clinicId, 
                procedureKeywords: keywords,
                isActive: true,
                order: content.length 
            })
        })
        
        setInstaUrl('')
        fetchContent()
      } else {
        const err = await res.json()
        alert(err.error || 'Instagram Import failed')
      }
    } catch (e) {
      console.error('Insta Import error:', e)
    } finally {
      setImportingInsta(false)
    }
  }

  const googleReviews = content.filter(c => c.type === 'google_review')
  const instaPosts = content.filter(c => c.type === 'instagram_post')

  return (
    <div className="space-y-12">
      {/* GOOGLE MAPS SECTION */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Globe className="text-blue-500" size={20} />
                    Google Maps Reviews
                </h3>
                <p className="text-sm text-gray-500">Import real feedback from your Maps profile</p>
            </div>
        </div>

        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow w-full">
                <label className="block text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1.5 ml-1">Search Clinic Name</label>
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" size={16} />
                        <input 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Clinic Name and City..."
                            value={googleQuery}
                            onChange={e => setGoogleQuery(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleGoogleImport}
                        disabled={importingGoogle || !googleQuery}
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
                    >
                        {importingGoogle ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        Import Reviews
                    </button>
                </div>
            </div>
        </div>

        {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-300" /></div>
        ) : googleReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {googleReviews.map(item => (
                    <div key={item.id} className={`bg-white border rounded-2xl p-4 transition-all ${item.isActive ? 'border-gray-200 shadow-sm' : 'border-gray-100 opacity-60'}`}>
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-0.5">
                                {[...Array(item.rating)].map((_, j) => <Star key={j} className="fill-yellow-400 text-yellow-400" size={12} />)}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleToggleActive(item)} className={`w-8 h-4 rounded-full relative transition-colors ${item.isActive ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${item.isActive ? 'left-4.5' : 'left-0.5'}`} />
                                </button>
                                <button onClick={() => handleDelete(item.id!)} className="text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <p className="text-sm text-gray-700 italic line-clamp-3 mb-3">"{item.text}"</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-900">{item.author}</span>
                            <div className="flex flex-wrap gap-1">
                                {item.procedureKeywords.map(k => (
                                    <span key={k} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[9px] font-bold uppercase">{k}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : null}
      </div>

      <hr className="border-gray-100" />

      {/* INSTAGRAM SECTION */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Instagram className="text-pink-500" size={20} />
                    Instagram Results
                </h3>
                <p className="text-sm text-gray-500">Add before/after photos from your Instagram</p>
            </div>
        </div>

        <div className="bg-pink-50/50 border border-pink-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-grow w-full">
                <label className="block text-[10px] font-black uppercase tracking-widest text-pink-400 mb-1.5 ml-1">Paste Post URL</label>
                <div className="flex gap-2">
                    <div className="relative flex-grow">
                        <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" size={16} />
                        <input 
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-pink-200 rounded-xl text-sm focus:ring-2 focus:ring-pink-500 focus:outline-none"
                            placeholder="https://www.instagram.com/p/..."
                            value={instaUrl}
                            onChange={e => setInstaUrl(e.target.value)}
                        />
                    </div>
                    <button 
                        onClick={handleInstagramImport}
                        disabled={importingInsta || !instaUrl}
                        className="bg-pink-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-pink-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-pink-200"
                    >
                        {importingInsta ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        Add Post
                    </button>
                </div>
            </div>
        </div>

        {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-300" /></div>
        ) : instaPosts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {instaPosts.map(item => (
                    <div key={item.id} className={`bg-white border rounded-2xl overflow-hidden transition-all ${item.isActive ? 'border-gray-200 shadow-sm' : 'border-gray-100 opacity-60'}`}>
                        <div className="aspect-square bg-gray-100 relative group">
                            {item.mediaUrl ? (
                                <img src={item.mediaUrl} className="w-full h-full object-cover" alt="Post" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300"><Instagram size={32} /></div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-1">
                                <button onClick={() => handleToggleActive(item)} className={`w-8 h-4 rounded-full relative transition-colors ${item.isActive ? 'bg-pink-600' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${item.isActive ? 'left-4.5' : 'left-0.5'}`} />
                                </button>
                                <button onClick={() => handleDelete(item.id!)} className="bg-white/90 p-1 rounded-md text-gray-400 hover:text-red-500 shadow-sm"><Trash2 size={12} /></button>
                            </div>
                        </div>
                        <div className="p-3">
                            <div className="flex flex-wrap gap-1 mb-2">
                                {item.procedureKeywords.map(k => (
                                    <span key={k} className="px-2 py-0.5 bg-pink-50 text-pink-600 rounded-md text-[8px] font-black uppercase">{k}</span>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-500 line-clamp-2 leading-tight">{item.caption}</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : null}
      </div>
    </div>
  )
}
