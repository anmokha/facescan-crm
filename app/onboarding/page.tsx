'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { saveClinicSettings } from '@/lib/diagnostic/dashboardService'
import { ArrowRight, Sparkles, Check, Zap, List, Globe } from 'lucide-react'

const AESTHETICS_TEMPLATE = [
  { name: "Консультация косметолога", price: "Бесплатно", category: "Общее" },
  { name: "Ботулотоксин (ед)", price: "350 ₽", category: "Инъекции" },
  { name: "Увеличение губ (1ml)", price: "15000 ₽", category: "Инъекции" },
  { name: "Биоревитализация", price: "9000 ₽", category: "Качество кожи" },
  { name: "Чистка лица (Combi)", price: "4500 ₽", category: "Уход" },
  { name: "Пилинг PRX-T33", price: "6000 ₽", category: "Пилинги" }
];

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [slugError, setSlugError] = useState('')
  const [website, setWebsite] = useState('')

  // Auto-generate slug from name
  useEffect(() => {
      if (name && step === 1) {
          setSlug(name.toLowerCase().replace(/[^a-z0-9]/g, ''))
          setSlugError('')
      }
  }, [name, step])

  useEffect(() => {
      if (!authLoading && !user) {
          router.push('/signup')
      }
  }, [user, authLoading, router])

  const handleReserveSlug = async () => {
      if (!user) return
      setSaving(true)
      setSlugError('')
      
      try {
          const token = await user.getIdToken();
          const res = await fetch('/api/reserve-slug', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ slug, name })
          });

          if (!res.ok) {
              const data = await res.json();
              throw new Error(data.error || 'Failed to save');
          }

          // Move to Step 2
          setStep(2);
          setSaving(false);
      } catch (e: any) {
          console.error(e)
          setSlugError(e.message || 'Failed to save settings')
          setSaving(false)
      }
  }

  const handleProcessWebsite = async () => {
      if (!user || !website) return;
      setSaving(true);
      try {
          const token = await user.getIdToken();
          const res = await fetch('/api/onboarding/process-website', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ websiteUrl: website })
          });

          if (!res.ok) {
            // If it fails (e.g. timeout or error), we just proceed to dashboard
            // expecting the user to configure manually later.
            console.warn('Website processing failed, proceeding anyway');
          }
          
          router.push('/dashboard');
      } catch (e) {
          console.error(e);
          // On error, still let them in
          router.push('/dashboard');
      } finally {
          setSaving(false);
      }
  };

  const handleSkip = async () => {
      // Just go to dashboard
      router.push('/dashboard');
  }

  if (authLoading) return null

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100 relative overflow-hidden">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
            <div 
                className="h-full bg-blue-600 transition-all duration-500"
                style={{ width: step === 1 ? '50%' : '100%' }}
            />
        </div>

        <div className="flex justify-center mb-8 pt-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <Sparkles size={32} />
            </div>
        </div>

        {step === 1 ? (
            <>
                <h1 className="text-3xl font-bold text-slate-900 text-center mb-2">Welcome!</h1>
                <p className="text-slate-500 text-center mb-10">Let's set up your profile in a few minutes.</p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">What is your clinic's name?</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                            placeholder="e.g. Epilux"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Your Address (Subdomain)</label>
                        <div className="flex items-center">
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 border border-slate-200 rounded-l-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 font-mono text-lg"
                                value={slug}
                                onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            />
                            <div className="bg-slate-100 px-4 py-3 border border-l-0 border-slate-200 rounded-r-xl text-slate-500 font-mono border-l">
                                .curescan.pro
                            </div>
                        </div>
                        {slugError && (
                            <p className="text-xs text-red-500 mt-2 font-medium">{slugError}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-2">Clients will see this address in links.</p>
                    </div>

                    <button 
                        onClick={handleReserveSlug}
                        disabled={!name || !slug || saving}
                        className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:transform-none disabled:shadow-none"
                    >
                        {saving ? 'Checking...' : 'Next'}
                        {!saving && <ArrowRight size={20} />}
                    </button>
                </div>
            </>
        ) : (
            <>
                <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">One last step</h1>
                <p className="text-slate-500 text-center mb-8 text-sm">
                    Enter your clinic's website. Our AI will automatically scan it and create your price list.
                </p>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-900 mb-2">Website URL</label>
                        <div className="relative">
                            <div className="absolute left-4 top-3.5 text-slate-400">
                                <Globe size={20} />
                            </div>
                            <input 
                                type="url" 
                                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
                                placeholder="https://example.com"
                                value={website}
                                onChange={e => setWebsite(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleProcessWebsite}
                        disabled={!website || saving}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-70 disabled:transform-none disabled:shadow-none"
                    >
                        {saving ? 'Scanning website...' : 'Finish Setup'}
                        {!saving && <Sparkles size={20} />}
                    </button>

                    <button 
                        onClick={handleSkip}
                        disabled={saving}
                        className="w-full py-2 text-slate-400 font-medium text-sm hover:text-slate-600 transition-colors"
                    >
                        Skip for now
                    </button>
                </div>
                
                {saving && (
                    <div className="text-center text-xs text-slate-400 mt-6 animate-pulse">
                        Analyzing your website... this takes about 10-20 seconds.
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  )
}