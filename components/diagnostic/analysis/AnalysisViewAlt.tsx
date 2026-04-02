'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Zap,
  ArrowRight, 
  AlertTriangle, 
  Star, 
  Clock, 
  Phone, 
  MessageCircle, 
  ExternalLink, 
  Info,
  Check,
  TrendingUp,
  Sparkles,
  Droplets,
  ScanFace,
  Calendar,
  Shield,
  Award,
  ChevronRight,
  Instagram
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts'
import { AnalysisResult, DiagnosticType } from '@/lib/diagnostic/types'
import { getMessages } from '@/lib/i18n/messages'
import type { Locale } from '@/lib/i18n'
import SocialProofSection from './SocialProofSection'
import ZoneProgress from '@/components/diagnostic/ZoneProgress'
import PhoneGate from '@/components/diagnostic/upload/PhoneGate'
import PhoneAuthForm from '@/components/auth/PhoneAuthForm'
import FaceScanner from './FaceScanner'

interface AnalysisViewProps {
  result?: AnalysisResult | null
  onReset: () => void
  diagnosticType?: DiagnosticType
  userImage?: string
  isLoading?: boolean
  trackingParams?: { source: string; campaign: string }
  images?: string[]
  clientSlug?: string
  clinicId?: string
  defaultPhoneCountry?: 'RU' | 'AE'
  locale?: Locale
  leadUnlockMethod?: 'otp' | 'phone'
  primaryContactChannel?: 'whatsapp' | 'sms' | 'phone' | 'instagram'
  whatsappNumber?: string
  instagramHandle?: string
  contactPhone?: string
  isDemoMode?: boolean
}

const SAFE_REVIEWS = [
  {
    author: "Aisha M.",
    rating: 5,
    text: "Very professional approach. The analysis helped me understand my skin better before booking.",
    date: "2 weeks ago",
    originalUrl: "https://maps.app.goo.gl/example1"
  },
  {
    author: "Maria K.",
    rating: 5,
    text: "I appreciated that they didn't push unnecessary treatments. The consultation was honest and helpful.",
    date: "1 month ago",
    originalUrl: "https://maps.app.goo.gl/example2"
  },
  {
    author: "Leila R.",
    rating: 5,
    text: "Effective treatments and friendly staff. My skin texture improved significantly after following their protocol.",
    date: "2 months ago",
    originalUrl: "https://maps.app.goo.gl/example3"
  }
];

export default function AnalysisViewAlt({
  result,
  onReset,
  diagnosticType = 'skin',
  userImage,
  isLoading = false,
  trackingParams,
  images = [],
  clientSlug,
  clinicId,
  defaultPhoneCountry,
  locale = 'en-US',
  leadUnlockMethod,
  primaryContactChannel,
  whatsappNumber,
  instagramHandle,
  contactPhone,
  isDemoMode = false
}: AnalysisViewProps) {
  const router = useRouter()
  const messages = getMessages(locale)
  
  const [isUnlocked, setIsUnlocked] = useState(isDemoMode)
  const [contentVisible, setContentVisible] = useState(false)
  const [whatsappClicked, setWhatsappClicked] = useState(false)
  const [callbackRequested, setCallbackRequested] = useState(false)
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null)
  const [leadUpdateToken, setLeadUpdateToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showScanner, setShowScanner] = useState(true)
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [isMounted, setIsMounted] = useState(false)
  const [showMetricDetails, setShowMetricDetails] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulatedImage, setSimulatedImage] = useState<string | null>(null)
  const [showSimModal, setShowSimModal] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isLoading && result) {
       const timer = setTimeout(() => {
         setShowScanner(false)
         setContentVisible(true)
       }, 3000)
       return () => clearTimeout(timer)
    }
  }, [isLoading, result])

  useEffect(() => {
    if (isUnlocked && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(p => p - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [isUnlocked, timeLeft])

  useEffect(() => {
    const sessionToken = localStorage.getItem('customerSession');
    if (sessionToken && !isUnlocked) {
      const verifyAndUnlock = async () => {
        try {
          const res = await fetch('/api/portal/verify-session', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${sessionToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            handleUnlock({ 
              phone: data.customer.phone,
              phoneCountry: data.customer.phoneCountry,
              sessionToken 
            });
          }
        } catch (e) {
          console.error("Auto-unlock failed", e);
        }
      };
      verifyAndUnlock();
    }
  }, []);

  const resolveClientSlug = () => {
    if (clientSlug) return clientSlug
    if (typeof window === 'undefined') return 'default'
    const hostname = window.location.hostname
    if (hostname.includes('localhost') || hostname.includes('vercel.app')) {
      const params = new URLSearchParams(window.location.search)
      return params.get('client') || 'default'
    }
    return hostname.split('.')[0]
  }

  const handleUnlock = async (payload: { phone: string; phoneCountry?: string; sessionToken?: string | null; captchaToken?: string | null; honeypot?: string; formStartedAt?: number; whatsappOptIn?: boolean }) => {
    if (!result) return
    setIsSubmitting(true)
    try {
      const { phone, phoneCountry, sessionToken, captchaToken, honeypot, formStartedAt, whatsappOptIn } = payload
      const clientId = resolveClientSlug()

      const res = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          phoneCountry,
          clientId,
          diagnosticType,
          analysisResult: result,
          tracking: trackingParams,
          images, 
          sessionToken,
          locale,
          captchaToken,
          captchaAction: 'lead_unlock',
          honeypot,
          formStartedAt,
          whatsappOptIn: whatsappOptIn || false,
          consentVersion: 'v1.0-alt-template',
          consentText: 'User unlocked in Alt Template'
        })
      })
      
      const data = await res.json()
      if (data.leadId) {
          setCurrentLeadId(data.leadId)
          if (data.leadUpdateToken) setLeadUpdateToken(data.leadUpdateToken)
          setIsUnlocked(true)
      }
    } catch (error) {
      console.error('AnalysisViewAlt: Error in handleUnlock:', error)
      alert(messages.analysisLeadSaveError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContact = async (channel: 'whatsapp' | 'phone' | 'instagram', treatment?: any) => {
    const isWhatsapp = channel === 'whatsapp'
    const isInstagram = channel === 'instagram'
    
    const procedureName = treatment?.name || result?.clinicTreatments?.[0]?.name || 'general_inquiry'
    
    const template = `Hello! I just finished my skin analysis on CureScan. My Skin Score is ${score}. I am interested in ${procedureName} recommended for me. I'd like to discuss the results and available consultation times.`
    
    if (isWhatsapp && whatsappNumber) {
        const digits = whatsappNumber.replace(/\D/g, '')
        window.open(`https://wa.me/${digits}?text=${encodeURIComponent(template)}`, '_blank')
    } else if (isInstagram && instagramHandle) {
        const handle = instagramHandle.replace('@', '')
        window.open(`https://ig.me/m/${handle}`, '_blank')
    } else if (channel === 'phone') {
        const phone = contactPhone || whatsappNumber
        if (phone) window.location.href = `tel:${phone.replace(/[^\d+]/g, '')}`
    }

    setWhatsappClicked(true)
    
    if (currentLeadId && leadUpdateToken) {
        fetch('/api/submit-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                leadId: currentLeadId,
                leadUpdateToken,
                action: channel === 'whatsapp' ? 'whatsapp_clicked' : channel === 'instagram' ? 'instagram_clicked' : 'phone_clicked',
                procedure: procedureName
            })
        }).catch(console.error)
    }
  }

  const handleSimulate = async () => {
    if (!userImage || !result?.clinicTreatments?.[0]?.name) return
    setIsSimulating(true)
    try {
      let base64Image = userImage;

      // If it's a blob URL, convert to base64
      if (userImage.startsWith('blob:')) {
        const response = await fetch(userImage);
        const blob = await response.blob();
        base64Image = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      }

      const res = await fetch('/api/simulate-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64Image,
          procedureName: result.clinicTreatments[0].name
        })
      })
      const data = await res.json()
      if (data.simulatedImage) {
        setSimulatedImage(data.simulatedImage)
        setShowSimModal(true)
      }
    } catch (e) {
      console.error("Simulation error", e)
    } finally {
      setIsSubmitting(false); // Reset submitting if it was stuck
      setIsSimulating(false)
    }
  }

  const score = result?.profile?.skin_score || 0
  const visualAge = result?.profile?.visual_age || result?.hidden_analysis?.estimated_visual_age
  const fitzpatrick = result?.profile?.fitzpatrick_type
  const skinType = result?.profile?.skinType
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const resolvedUnlockMethod = leadUnlockMethod || (defaultPhoneCountry === 'AE' ? 'phone' : 'otp')
  const captchaProvider = ((process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER || 'none').toLowerCase() as 'turnstile' | 'recaptcha' | 'none')

  const getStatusColor = (s: number) => {
    if (s >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-600', from: '#10b981', label: messages.analysisStatusExcellent }
    if (s >= 60) return { bg: 'bg-amber-500', text: 'text-amber-600', from: '#f59e0b', label: messages.analysisStatusHasNuances }
    return { bg: 'bg-rose-500', text: 'text-rose-600', from: '#ef4444', label: messages.analysisStatusNeedsAttention }
  }
  const status = getStatusColor(score)

  if (showScanner && userImage) {
    return (
      <div className="w-full max-w-lg mx-auto">
        <FaceScanner 
          imageSrc={userImage}
          markers={result?.markers}
          isLoading={isLoading}
          onScanComplete={() => {
            setShowScanner(false)
            setContentVisible(true)
          }}
        />
      </div>
    )
  }

  if (!contentVisible) return null

  return (
    <div className="w-full max-w-lg mx-auto pb-32 px-4 md:px-0">
      <section className="relative rounded-[2rem] overflow-hidden bg-slate-900 shadow-2xl mb-6">
        <div className="relative aspect-[4/5]">
          {userImage && (
            <img src={userImage} className="w-full h-full object-cover opacity-90" alt="Analysis" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 pt-32">
            <div className="flex justify-between items-end mb-6">
              <div className="text-left">
                <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Skin Score</div>
                <div className={`text-6xl font-black text-white`}>{score}</div>
              </div>
              {visualAge && (
                <div className="text-right">
                  <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1">{messages.analysisVisualAgeLabel}</div>
                  <div className="text-6xl font-black text-[#10b981]">{visualAge}</div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mb-8">
              <div className={`w-3 h-3 rounded-full animate-pulse ${status.bg}`} />
              <span className={`text-sm font-bold uppercase tracking-widest text-white/80`}>{status.label}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
              <div className="text-left overflow-hidden">
                <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1 truncate">{messages.analysisSkinTypeLabel}</div>
                <div className="text-lg font-black text-white leading-tight break-words">{skinType || 'N/A'}</div>
              </div>
              <div className="text-left overflow-hidden">
                <div className="text-white/40 text-[10px] uppercase tracking-widest mb-1 truncate">Fitzpatrick Type</div>
                <div className="text-lg font-black text-white leading-tight break-words">Type {fitzpatrick || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 flex gap-3">
        <Info className="shrink-0 text-slate-400 mt-0.5" size={18} />
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong>Disclaimer:</strong> This is an automated visual assessment based on AI analysis. 
          It is <strong>not</strong> a medical diagnosis or consultation. Results are approximate. 
          For accurate evaluation, please consult a licensed specialist.
        </p>
      </div>

      {result?.profile?.personal_insight && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-10 text-left"
        >
          <p className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed italic">
            "{result.profile.personal_insight}"
          </p>
        </motion.div>
      )}

      <div className="relative">
        {!isUnlocked && (
          <div className="sticky top-4 z-20 backdrop-blur-xl bg-white/90 flex flex-col items-center py-6 px-4 text-center rounded-2xl shadow-xl border border-slate-200 mx-2">
            <div className="w-full bg-white rounded-2xl p-4 md:p-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ScanFace className="text-slate-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Unlock Full Analysis</h3>
              <p className="text-slate-500 mb-6 text-sm">
                Enter your phone number to see detailed metrics and personalized recommendations.
              </p>
              
              {resolvedUnlockMethod === 'phone' ? (
                <PhoneGate 
                  isLoading={isSubmitting}
                  defaultPhoneCountry={defaultPhoneCountry}
                  locale={locale}
                  captchaProvider={captchaProvider}
                  onUnlock={(p) => {
                    handleUnlock({ 
                      phone: p.phone, 
                      phoneCountry: p.phoneCountry,
                      captchaToken: p.captchaToken,
                      honeypot: p.honeypot,
                      formStartedAt: p.formStartedAt,
                      whatsappOptIn: p.whatsappOptIn
                    });
                  }}
                />
              ) : (
                <PhoneAuthForm 
                  clinicId={clinicId || resolveClientSlug()}
                  defaultPhoneCountry={defaultPhoneCountry}
                  locale={locale}
                  onSuccess={(p) => handleUnlock({ 
                    phone: p.phone, 
                    phoneCountry: p.phoneCountry, 
                    sessionToken: p.sessionToken 
                  })}
                />
              )}
            </div>
          </div>
        )}

        <div className={!isUnlocked ? 'opacity-20 pointer-events-none select-none blur-sm' : ''}>
          <section className="mb-10">
            <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center gap-2 tracking-tight">
              <Droplets size={18} className="text-amber-500" />
              Skin Metrics Analysis
            </h3>
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-xl shadow-slate-200/40 overflow-hidden">
              <div className="flex flex-col gap-8">
                {/* Radar Chart Section */}
                <div className="w-full h-[320px] flex flex-col items-center justify-center relative">
                  {isMounted && result?.metrics ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                        { subject: messages.analysisMetricHydration, A: result?.metrics?.hydration || 0 },
                        { subject: messages.analysisMetricPores, A: result?.metrics?.pores || 0 },
                        { subject: messages.analysisMetricTexture, A: result?.metrics?.texture || 0 },
                        { subject: messages.analysisMetricFirmness, A: result?.metrics?.firmness || 0 },
                        { subject: messages.analysisMetricBarrier, A: result?.metrics?.barrier || 0 },
                        { subject: messages.analysisMetricTone, A: result?.metrics?.tone || 0 },
                      ]}>
                        <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        
                        {/* Glow Layer for Low Scores */}
                        <Radar
                          name="Warning"
                          dataKey="A"
                          stroke="transparent"
                          fill="#ef4444"
                          fillOpacity={score < 60 ? 0.1 : 0}
                        />

                        <Radar
                          name="Skin Metrics"
                          dataKey="A"
                          stroke="#6366f1"
                          strokeWidth={2}
                          fill="#bae6fd"
                          fillOpacity={0.3}
                          animationBegin={300}
                          animationDuration={1500}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full border-4 border-amber-100 border-t-amber-500 animate-spin" />
                    </div>
                  )}
                  
                  <button 
                    onClick={() => setShowMetricDetails(!showMetricDetails)}
                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-widest rounded-full transition-all border border-amber-200/50"
                  >
                    <Info size={12} />
                    {showMetricDetails ? messages.analysisLessDetails : 'Understand your metrics'}
                  </button>
                </div>

                {/* Details Section (Expandable downwards) */}
                {showMetricDetails && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="grid grid-cols-1 gap-3 pt-4 border-t border-slate-50"
                  >
                    {[
                      { key: 'hydration', name: messages.analysisMetricHydration, desc: messages.analysisMetricDescriptionHydration, val: result?.metrics?.hydration },
                      { key: 'pores', name: messages.analysisMetricPores, desc: messages.analysisMetricDescriptionPores, val: result?.metrics?.pores },
                      { key: 'texture', name: messages.analysisMetricTexture, desc: messages.analysisMetricDescriptionTexture, val: result?.metrics?.texture },
                      { key: 'firmness', name: messages.analysisMetricFirmness, desc: messages.analysisMetricDescriptionFirmness, val: result?.metrics?.firmness },
                      { key: 'barrier', name: messages.analysisMetricBarrier, desc: messages.analysisMetricDescriptionBarrier, val: result?.metrics?.barrier },
                      { key: 'tone', name: messages.analysisMetricTone, desc: messages.analysisMetricDescriptionTone, val: result?.metrics?.tone },
                    ].map((m, i) => (
                      <div key={i} className="p-4 bg-amber-50/30 rounded-xl border border-amber-100/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-black text-amber-900 uppercase tracking-wider">{m.name}</span>
                          <span className="text-xs font-bold text-amber-600">{m.val}/100</span>
                        </div>
                        <p className="text-sm text-amber-800/70 leading-relaxed italic">
                          {result?.metrics_analysis?.[m.key] || m.desc}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
          </section>

          {result?.profile?.prognosis && (
            <section className="mb-10">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-slate-400" />
                3-Month Outlook
              </h3>
              <div className="space-y-4">
                <div className="bg-rose-50/50 border border-rose-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2 text-rose-700 font-bold text-sm uppercase tracking-wide">
                    <AlertTriangle size={16} />
                    Without Additional Care
                  </div>
                  <p className="text-rose-900/70 text-sm leading-relaxed">
                    {result.profile.prognosis.negative_scenario}
                  </p>
                </div>
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-sm uppercase tracking-wide">
                    <TrendingUp size={16} />
                    With Recommended Protocol
                  </div>
                  <p className="text-emerald-900/70 text-sm leading-relaxed">
                    {result.profile.prognosis.positive_scenario}
                  </p>
                </div>
              </div>
            </section>
          )}

          {result?.clinicTreatments && result.clinicTreatments.length > 0 && (
            <section className="mb-10 px-2">
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2 tracking-tight">
                <Sparkles size={20} className="text-amber-500" />
                Recommended Procedures
              </h3>
              
              <div className="flex flex-col gap-6">
                {/* 1. TOP RECOMMENDATION (Gold Frame) */}
                {result.clinicTreatments[0] && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-200 via-amber-500 to-amber-200 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000" />
                    
                    <div className="relative bg-white border-2 border-amber-400 rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-amber-200/40 overflow-hidden">
                      <div className="flex flex-col gap-6">
                        <div>
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-amber-100">
                             <Star size={12} fill="currentColor" />
                             {messages.analysisBestChoiceBadge}
                          </div>
                          <h4 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2 leading-tight">
                            {result.clinicTreatments[0].name}
                          </h4>
                          <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                            {result.clinicTreatments[0].projected_improvement || result.clinicTreatments[0].reason}
                          </p>
                        </div>

                        {result.clinicTreatments[0].personalized_benefits && (
                          <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100/50">
                            <p className="text-amber-900 text-xs font-medium italic leading-relaxed">
                              "{result.clinicTreatments[0].personalized_benefits}"
                            </p>
                          </div>
                        )}

                        <button 
                          onClick={() => {
                            const firstTreatment = result?.clinicTreatments?.[0];
                            if (firstTreatment) handleContact('whatsapp', firstTreatment);
                          }}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-500/30 active:scale-[0.98]"
                        >
                          <MessageCircle size={24} fill="currentColor" />
                          Book Consultation
                        </button>

                        {/* AI Simulation Feature - Commented out until prompt optimization achieves clinical-grade results
                        <button 
                          onClick={handleSimulate}
                          disabled={isSimulating}
                          className="w-full bg-white border-2 border-indigo-600 text-indigo-600 h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:bg-indigo-50 active:scale-[0.98] disabled:opacity-50"
                        >
                          {isSimulating ? (
                            <div className="w-6 h-6 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                          ) : (
                            <Sparkles size={24} />
                          )}
                          Simulate Result
                        </button>
                        */}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2 & 3. ALTERNATIVES (Grid) */}
                {result.clinicTreatments.length > 1 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.clinicTreatments.slice(1, 3).map((treatment: any, idx: number) => (
                      <div 
                        key={idx}
                        className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-lg shadow-slate-200/30 flex flex-col justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg mb-2">{treatment.name}</h4>
                          <p className="text-slate-500 text-xs leading-relaxed mb-4 line-clamp-3">
                            {treatment.projected_improvement || treatment.reason}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleContact('whatsapp', treatment)}
                          className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                        >
                          Details
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          <SocialProofSection 
            clinicId={clinicId || clientSlug || 'default'} 
            procedure={result?.clinicTreatments?.[0]?.name}
            locale={locale}
          />

          {result?.comparison?.zoneProgress && result.comparison.zoneProgress.length > 0 && (
            <section className="mb-10">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Progress Since Last Checkup</h3>
              <ZoneProgress zoneProgress={result.comparison.zoneProgress} />
            </section>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isUnlocked && !whatsappClicked && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] z-40"
          >
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className="text-rose-500" />
                  <span className="font-medium">Priority consultation offer expires in {formatTime(timeLeft)}</span>
                </span>
                <span className="text-slate-400">Response within 5 min</span>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => handleContact('phone')}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors h-14"
                >
                  <Phone size={18} />
                  <span className="hidden sm:inline">Call</span>
                </button>
                <button 
                  onClick={() => handleContact('whatsapp')}
                  className="flex-[2] bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-green-500/25 h-14"
                >
                  <MessageCircle size={20} />
                  WhatsApp
                </button>
              </div>
              
              <p className="text-center text-[10px] text-slate-400 mt-3">
                Your data is confidential and will only be shared with the clinic
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {whatsappClicked && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-sm"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600" size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">WhatsApp Opened</h3>
            <p className="text-slate-600 mb-8">
              The clinic will respond shortly with available consultation times.
            </p>
            <button 
              onClick={() => setWhatsappClicked(false)}
              className="text-slate-400 hover:text-slate-600 text-sm"
            >
              Return to results
            </button>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showSimModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
              onClick={() => setShowSimModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setShowSimModal(false)}
                className="absolute top-6 right-6 z-10 w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors"
              >
                <Zap size={20} className="fill-white" />
              </button>

              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">AI Clinical Simulation</h3>
                    <p className="text-sm text-slate-500 font-medium">Estimated result after {result?.clinicTreatments?.[0]?.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Before</div>
                    <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                      <img src={userImage} className="w-full h-full object-cover" alt="Original" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest pl-2">Simulated Outcome</div>
                    <div className="aspect-[3/4] rounded-3xl overflow-hidden border border-indigo-100 shadow-2xl bg-indigo-50 relative group">
                      <img 
                        src={simulatedImage?.startsWith('data:') ? simulatedImage : `data:image/jpeg;base64,${simulatedImage}`} 
                        className="w-full h-full object-cover" 
                        alt="Simulated" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent opacity-60" />
                      <div className="absolute bottom-4 left-0 right-0 text-center">
                         <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">Enhanced Glow & Texture</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 mb-8">
                  <p className="text-[10px] text-amber-800 leading-relaxed font-medium text-center uppercase tracking-wide">
                    ⚠️ AI Simulation - results may vary. This is a visual estimation based on clinical treatment protocols and analyzed skin parameters.
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setShowSimModal(false);
                    const firstTreatment = result?.clinicTreatments?.[0];
                    if (firstTreatment) handleContact('whatsapp', firstTreatment);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white h-16 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                >
                  <MessageCircle size={24} fill="currentColor" />
                  Claim This Result Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
