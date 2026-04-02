import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, ArrowRight, Activity, AlertTriangle, TrendingUp, Star, ChevronDown, ChevronUp, Sparkles, MessageCircle, Check, ChevronRight, Phone, Instagram, Shield, Award, Cpu, Info } from 'lucide-react'
import { AnalysisResult, DiagnosticType } from '@/lib/diagnostic/types'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts'
import PhoneAuthForm from '@/components/auth/PhoneAuthForm'
import QuizWidget from '@/components/diagnostic/upload/QuizWidget'
import PhoneGate from '@/components/diagnostic/upload/PhoneGate'
import FaceScanner from './FaceScanner'
import { motion, AnimatePresence } from 'framer-motion'
import ZoneProgress from '@/components/diagnostic/ZoneProgress'
import SocialProofSection from './SocialProofSection'
import type { Locale } from '@/lib/i18n'
import { getMessages } from '@/lib/i18n/messages'

interface AnalysisViewProps {
  result?: AnalysisResult | null
  onReset: () => void
  diagnosticType?: DiagnosticType
  userImage?: string
  isLoading?: boolean
  trackingParams?: { source: string; campaign: string }
  images?: string[] // Array of Base64 strings for submission
  clientSlug?: string // Slug (preferred over hostname parsing) for submit-lead routing
  clinicId?: string // Clinic UID for portal/auth
  defaultPhoneCountry?: 'RU' | 'AE'
  locale?: Locale
  leadUnlockMethod?: 'otp' | 'phone'
  primaryContactChannel?: 'whatsapp' | 'sms' | 'phone' | 'instagram'
  whatsappNumber?: string
  instagramHandle?: string
  contactPhone?: string
  isDemoMode?: boolean // Skip phone gate in demo mode
}

export default function AnalysisView({
  result,
  onReset,
  diagnosticType = 'hair',
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
  const [isUnlocked, setIsUnlocked] = useState(isDemoMode) // Auto-unlock in demo mode
  const [callbackRequested, setCallbackRequested] = useState(false)
  const [selectedProcedure, setSelectedProcedure] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [score, setScore] = useState(0)
  const [expandedTreatment, setExpandedTreatment] = useState<number | null>(null)
  const [showMetricDetails, setShowMetricDetails] = useState(false)
  const [whatsappClicked, setWhatsappClicked] = useState(false)
  const [clickedProcedure, setClickedProcedure] = useState<string | null>(null)
  const [hasOptIn, setHasOptIn] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [currentLeadId, setCurrentLeadId] = useState<string | null>(null)
  const [leadUpdateToken, setLeadUpdateToken] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutes in seconds
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (callbackRequested && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [callbackRequested, timeLeft])

  // Auto-unlock if session exists
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

  // If we have markers/image OR we are loading, we wait for scan. If not, show content immediately.
  const hasVisuals = !!(userImage && (isLoading || (result?.markers && result.markers.length > 0)))
  const [contentVisible, setContentVisible] = useState(!hasVisuals)

  // Calculate score on mount or result change
  useEffect(() => {
    if (!result) return

    const safetyTimer = setTimeout(() => {
        setContentVisible(true);
    }, 4000);

    if (result?.profile?.skin_score) {
      setScore(result.profile.skin_score)
    }
    
    let calculatedScore = 88
    if (result?.profile) {
      const textLen = JSON.stringify(result.profile).length
      if (textLen > 200) calculatedScore -= 5
      if (textLen > 400) calculatedScore -= 5
      if (result.clinicTreatments && result.clinicTreatments.length > 2) calculatedScore -= 10
    }
    
    if (!result?.profile?.skin_score) {
        setScore(Math.max(45, Math.min(98, calculatedScore)))
    }

    return () => clearTimeout(safetyTimer);
  }, [result])

  // Trigger Quiz Widget after unlock with delay (only if WhatsApp not clicked)
  useEffect(() => {
      if (isUnlocked && !whatsappClicked) {
          const timer = setTimeout(() => {
              setShowQuiz(true)
          }, 15000) 
          return () => clearTimeout(timer)
      }
  }, [isUnlocked, whatsappClicked])

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
          consentVersion: 'v1.0-dubai-pilot',
          consentText: 'User agreed to WhatsApp contact for results and booking'
        })
      })
      
      const data = await res.json()
      if (data.leadId) {
          setCurrentLeadId(data.leadId)
          if (data.leadUpdateToken) {
            setLeadUpdateToken(data.leadUpdateToken)
          }
          setHasOptIn(whatsappOptIn || false) 
          setIsUnlocked(true)
      }

    } catch (error) {
      console.error('Failed to submit lead:', error)
      alert(messages.analysisLeadSaveError)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleQuizSubmit = async (answers: any, email: string) => {
      if (!currentLeadId) return
      try {
          await fetch('/api/submit-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                leadId: currentLeadId,
                leadUpdateToken,
                email,
                quizAnswers: answers
            })
          })

          await fetch('/api/send-analysis-report', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  leadId: currentLeadId,
                  leadUpdateToken
              })
          })

      } catch (e) {
          console.error("Quiz submit error", e)
      }
  }

  const handleContact = async () => {
    const leadId = currentLeadId
    const isWhatsapp = primaryContactChannel === 'whatsapp' || (Boolean(whatsappNumber) && primaryContactChannel !== 'instagram')
    const isInstagram = primaryContactChannel === 'instagram' && Boolean(instagramHandle)

    const topTreatment = result?.clinicTreatments?.[0]
    const procedures = result?.clinicTreatments?.slice(0, 1).map(t => t.name).join(' and ')
    const procedureSuffix = procedures ? `. I am interested in ${procedures} recommended for me.` : '.'

    const template =
      result?.hidden_analysis?.whatsapp_templates?.result ||
      `Hello! I just finished my skin analysis on CureScan. My Skin Score is ${score}. ${procedureSuffix} I'd like to discuss the results and book a consultation.`

    if (isWhatsapp && whatsappNumber) {
      const digits = whatsappNumber.replace(/\D/g, '')
      if (digits) {
        window.open(`https://wa.me/${digits}?text=${encodeURIComponent(template)}`, '_blank', 'noopener,noreferrer')
      }
    } else if (isInstagram && instagramHandle) {
      const handle = instagramHandle.replace('@', '')
      window.open(`https://ig.me/m/${handle}`, '_blank', 'noopener,noreferrer')
    } else if (contactPhone) {
      const telDigits = contactPhone.replace(/[^\d+]/g, '')
      if (telDigits) window.location.href = `tel:${telDigits}`
    } else {
      handleRequestCallback()
      return
    }

    setWhatsappClicked(true) 
    setClickedProcedure('general_inquiry')

    if (leadId && leadUpdateToken) {
      try {
        await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            leadUpdateToken,
            action: isWhatsapp ? 'whatsapp_clicked' : isInstagram ? 'instagram_clicked' : 'phone_clicked',
            procedure: 'general_inquiry'
          })
        })
      } catch (e) {
        console.error('Failed to log contact click:', e)
      }
    }
  }

  const trackProcedureInterest = async (procedure: string) => {
    const leadId = currentLeadId
    if (!procedure) return
    setSelectedProcedure(procedure)
    if (!leadId || !leadUpdateToken) return
    try {
      await fetch('/api/submit-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          leadUpdateToken,
          action: 'treatment_viewed',
          procedure
        })
      })
    } catch (e) {
      console.error('Failed to track treatment view:', e)
    }
  }

  const handleRequestCallback = async () => {
    const leadId = currentLeadId
    const topTreatment = result?.clinicTreatments?.[0]
    const procedureName = selectedProcedure || topTreatment?.name || null

    if (leadId && leadUpdateToken) {
      try {
        await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            leadUpdateToken,
            action: 'callback_requested',
            procedure: procedureName
          })
        })
        setCallbackRequested(true)
      } catch (e) {
        console.error('Failed to request callback:', e)
      }
    }
  }

  const getGradientColors = (s: number) => {
    if (s < 60) {
      return {
        from: '#ef4444',
        to: '#b91c1c',
        text: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-100',
        label: messages.analysisStatusNeedsAttention
      }
    }
    if (s < 85) {
      return {
        from: '#f59e0b',
        to: '#ea580c',
        text: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        label: messages.analysisStatusHasNuances
      }
    }
    return {
      from: '#4ade80',
      to: '#16a34a',
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      label: messages.analysisStatusExcellent
    }
  }

  const status = getGradientColors(score)
  const visualAge = result?.profile?.visual_age || result?.hidden_analysis?.estimated_visual_age
  const resolvedUnlockMethod: 'otp' | 'phone' = leadUnlockMethod
    ? leadUnlockMethod
    : defaultPhoneCountry === 'AE'
      ? 'phone'
      : 'otp'
  const wantsWhatsApp = (primaryContactChannel || (defaultPhoneCountry === 'AE' ? 'whatsapp' : 'sms')) === 'whatsapp'
  const bookCtaLabel = wantsWhatsApp ? messages.analysisBookOnWhatsApp : messages.analysisBookTreatment
  const captchaProvider = ((process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER || 'none').toLowerCase() as 'turnstile' | 'recaptcha' | 'none')
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ''

  const handleBook = async (treatment?: any) => {
    const leadId = currentLeadId
    const topTreatment = result?.clinicTreatments?.[0]
    const procedureName = treatment?.name || topTreatment?.name || 'specific_treatment'
    
    const template =
      result?.hidden_analysis?.whatsapp_templates?.offer ||
      `Hello! I just finished my skin analysis on CureScan. My Skin Score is ${score}. I'm interested in ${procedureName}. I'd like to discuss the results and book a consultation.`
    
    const text = typeof template === 'string' && template.trim().length > 0 ? template : messages.whatsappFallbackMessage(leadId)

    const isWhatsapp = primaryContactChannel === 'whatsapp' || (Boolean(whatsappNumber) && primaryContactChannel !== 'instagram')
    const isInstagram = primaryContactChannel === 'instagram' && Boolean(instagramHandle)

    if (isWhatsapp && whatsappNumber) {
      const digits = whatsappNumber.replace(/\D/g, '')
      if (!digits) return
      window.open(`https://wa.me/${digits}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer')
    } else if (isInstagram && instagramHandle) {
      const handle = instagramHandle.replace('@', '')
      window.open(`https://ig.me/m/${handle}`, '_blank', 'noopener,noreferrer')
    } else {
        const phone = contactPhone || whatsappNumber
        if (!phone) return
        const telDigits = phone.replace(/[^\d+]/g, '')
        if (!telDigits) return
        window.location.href = `tel:${telDigits}`
        return
    }

    setWhatsappClicked(true)
    setClickedProcedure(procedureName)

    if (leadId && leadUpdateToken) {
      try {
        await fetch('/api/submit-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId,
            leadUpdateToken,
            action: isWhatsapp ? 'whatsapp_clicked' : isInstagram ? 'instagram_clicked' : 'phone_clicked',
            procedure: procedureName
          })
        })
      } catch (e) {
        console.error('Failed to log contact click:', e)
      }
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto pb-24 md:pb-0">
      
      {/* 1. VISUAL SCANNER SECTION */}
      {hasVisuals && userImage && (
        <div className="mb-8">
            <FaceScanner 
                imageSrc={userImage} 
                markers={result?.markers} 
                onScanComplete={() => setContentVisible(true)}
                isLoading={isLoading}
            />
            {isLoading && (
              <div className="text-center mt-4 animate-pulse text-slate-500 font-medium">
                {messages.analysisProcessing}
              </div>
            )}
        </div>
      )}

      {/* Main Content Area - Fades in after scan */}
      {result && (
      <motion.div 
        initial={{ opacity: hasVisuals ? 0 : 1, y: 20 }}
        animate={{ opacity: contentVisible ? 1 : 0, y: contentVisible ? 0 : 20 }}
        transition={{ duration: 0.8 }}
      >
          {/* Header Summary */}
          <div className="text-center mb-10 pt-2">
            <div className={`flex flex-col items-center justify-center mb-8 transition-all duration-700 ${!isUnlocked ? 'blur-xl scale-95 opacity-80' : ''}`}>
                
                {/* Premium Info Blocks */}
                <div className="w-full max-w-2xl space-y-3">
                  {/* Row 1: Score & Visual Age */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Skin Score</span>
                      <span className={`text-3xl font-black ${status.text}`}>{score}</span>
                    </div>
                    {visualAge && (
                      <div className="flex-1 bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{messages.analysisVisualAgeLabel}</span>
                        <div className="text-right">
                          <span className="text-3xl font-black text-slate-900">{visualAge}</span>
                          <span className="text-xs font-bold text-emerald-500 block -mt-1">Better than expected</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Row 2: Type & Fitzpatrick */}
                  <div className="flex flex-col md:flex-row gap-3">
                    {result?.profile?.skinType && (
                      <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{messages.analysisSkinTypeLabel}</span>
                        <span className="text-lg font-bold text-slate-900">{result.profile.skinType}</span>
                      </div>
                    )}
                    {result?.profile?.fitzpatrick_type && (
                      <div className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Fitzpatrick Type</span>
                        <span className="text-lg font-bold text-slate-900">Type {result.profile.fitzpatrick_type}</span>
                      </div>
                    )}
                  </div>
                </div>
            </div>

            {/* Personal Insight Block */}
            {result?.profile?.personal_insight && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-2xl mx-auto mb-10 px-4"
              >
                <div className="relative">
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-indigo-500 rounded-full opacity-20" />
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-[0.2em] mb-3 text-left pl-4">
                    {messages.analysisPersonalInsightTitle}
                  </h3>
                  <p className="text-xl md:text-2xl text-slate-800 font-medium leading-relaxed text-left pl-4 italic">
                    "{result.profile.personal_insight}"
                  </p>
                </div>
              </motion.div>
            )}

            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 tracking-tight px-4">
              {messages.analysisSkinMapTitle}
            </h2>
            
            {result?.comparison?.quality === 'bad' && (
              <div className="mx-auto max-w-2xl mt-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl px-4 py-3 text-sm font-medium flex items-start gap-2">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <span>{messages.analysisPhotosNotComparable}</span>
              </div>
            )}

            {result?.comparison?.zoneProgress && result.comparison.zoneProgress.length > 0 && (
              <div className="mx-auto max-w-3xl mt-8 mb-8">
                <ZoneProgress zoneProgress={result.comparison.zoneProgress} />
              </div>
            )}

            {whatsappClicked && (
              <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 max-w-2xl mx-auto">
                <Check className="text-emerald-600 shrink-0" size={24} />
                <div>
                  <div className="font-bold text-emerald-900">
                    {messages.analysisWhatsAppOpened || 'WhatsApp opened!'}
                  </div>
                  <div className="text-sm text-emerald-700">
                    {messages.analysisWhatsAppOpenedSubtitle || 'The clinic will respond shortly with available times.'}
                  </div>
                </div>
              </div>
            )}

            {callbackRequested && !whatsappClicked && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 max-w-2xl mx-auto">
                <Check className="text-amber-700 shrink-0" size={24} />
                <div className="font-bold text-amber-900">
                  {messages.analysisWeWillContactYou || 'We will contact you.'}
                </div>
              </div>
            )}

            {isUnlocked && !whatsappClicked && !callbackRequested && (
              <div className="mb-12 max-w-2xl mx-auto relative group">
                <div className="absolute -inset-4 bg-indigo-500/10 rounded-[2.5rem] blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
                
                <div className="relative p-2 rounded-[2rem] bg-white border border-slate-100 shadow-2xl">
                    <div className="relative overflow-hidden rounded-[1.5rem]">
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                            <motion.rect
                                x="2"
                                y="2"
                                width="calc(100% - 4px)"
                                height="calc(100% - 4px)"
                                rx="24"
                                fill="transparent"
                                stroke="#6366f1"
                                strokeWidth="4"
                                style={{ pathLength: timeLeft / (15 * 60) }}
                                transition={{ duration: 1, ease: "linear" }}
                            />
                        </svg>

                        <button
                          onClick={handleContact}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white px-8 py-6 rounded-[1.5rem] transition-all flex items-center justify-between group relative overflow-hidden"
                        >
                          <div className="flex items-center gap-5">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg ${primaryContactChannel === 'instagram' ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-pink-500/40' : 'bg-indigo-600 shadow-indigo-500/40'}`}>
                              {primaryContactChannel === 'instagram' ? <Instagram className="text-white" size={32} /> : <Sparkles className="text-white" size={32} />}
                            </div>
                            <div className="text-left">
                              <div className="font-black text-white text-xl md:text-2xl tracking-tight uppercase">
                                {primaryContactChannel === 'instagram' ? 'Contact in Instagram' : messages.analysisGetPersonalOffer || 'Get Personal Offer'}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-sm font-bold text-red-400">
                                  {formatTime(timeLeft)} remaining
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="hidden md:block text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-white transition-colors">Claim Now</span>
                             <ChevronRight className="text-indigo-400 group-hover:translate-x-2 transition-transform" size={28} />
                          </div>
                        </button>
                    </div>
                </div>
                
                <p className="text-center mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    AI recommendation: Book within the next 15 minutes for priority consultation
                </p>
              </div>
            )}
          </div>

          <div className="relative min-h-[400px]">
            {!isUnlocked && (
              <div className="absolute top-6 left-0 right-0 z-30 flex items-start justify-center p-4">
                <div className="w-full max-w-md">
                    {resolvedUnlockMethod === 'phone' ? (
                      <PhoneGate
                        isLoading={isSubmitting}
                        defaultPhoneCountry={defaultPhoneCountry}
                        locale={locale}
                        captchaProvider={captchaProvider}
                        turnstileSiteKey={turnstileSiteKey}
                        recaptchaSiteKey={recaptchaSiteKey}
                        onUnlock={(payload) =>
                          handleUnlock({
                            phone: payload.phone,
                            phoneCountry: payload.phoneCountry,
                            captchaToken: payload.captchaToken,
                            honeypot: payload.honeypot,
                            formStartedAt: payload.formStartedAt
                          })
                        }
                      />
                    ) : (
                      <PhoneAuthForm
                        clinicId={clinicId || resolveClientSlug()}
                        defaultPhoneCountry={defaultPhoneCountry}
                        locale={locale}
                        title={messages.otpUnlockTitle}
                        subtitle={messages.otpUnlockSubtitle}
                        onSuccess={(payload) =>
                          handleUnlock({
                            phone: payload.phone,
                            phoneCountry: payload.phoneCountry,
                            sessionToken: payload.sessionToken
                          })
                        }
                      />
                    )}
	                </div>
	              </div>
	            )}
            
            <QuizWidget
                isVisible={showQuiz && !whatsappClicked}
                onClose={() => setShowQuiz(false)}
                onQuizSubmit={handleQuizSubmit}
                quizData={result?.generated_quiz}
            />

            <div className={!isUnlocked ? 'filter blur-xl select-none pointer-events-none' : ''}>

              {result?.metrics ? (
                 <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 overflow-hidden">
                     <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Radar Chart Section */}
                        <div className="w-full md:w-1/2 h-[340px] flex flex-col items-center justify-center relative">
                          {isMounted ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={[
                                { subject: messages.analysisMetricHydration, A: result.metrics.hydration, fullMark: 100 },
                                { subject: messages.analysisMetricPores, A: result.metrics.pores, fullMark: 100 },
                                { subject: messages.analysisMetricTexture, A: result.metrics.texture, fullMark: 100 },
                                { subject: messages.analysisMetricFirmness, A: result.metrics.firmness, fullMark: 100 },
                                { subject: messages.analysisMetricBarrier, A: result.metrics.barrier, fullMark: 100 },
                                { subject: messages.analysisMetricTone, A: result.metrics.tone, fullMark: 100 },
                              ]}>
                                <PolarGrid stroke="#fef3c7" strokeWidth={1} />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#92400e', fontSize: 10, fontWeight: 700 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                  name="Skin Metrics"
                                  dataKey="A"
                                  stroke="#d97706"
                                  strokeWidth={2}
                                  fill="#fbbf24"
                                  fillOpacity={0.2}
                                  animationBegin={300}
                                  animationDuration={1500}
                                />
                              </RadarChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-32 h-32 rounded-full border-4 border-amber-100 border-t-amber-500 animate-spin" />
                            </div>
                          )}
                          
                          <button 
                            onClick={() => setShowMetricDetails(!showMetricDetails)}
                            className="mt-2 flex items-center gap-2 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-full transition-all border border-amber-200/50"
                          >
                            <Info size={14} />
                            {showMetricDetails ? messages.analysisLessDetails : 'Understand your metrics'}
                          </button>
                        </div>

                        {/* Summary & Trust Section */}
                        <div className="w-full md:w-1/2 space-y-6">
                            {showMetricDetails ? (
                              <motion.div 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar"
                              >
                                {[
                                  { name: messages.analysisMetricHydration, desc: messages.analysisMetricDescriptionHydration, val: result.metrics.hydration },
                                  { name: messages.analysisMetricPores, desc: messages.analysisMetricDescriptionPores, val: result.metrics.pores },
                                  { name: messages.analysisMetricTexture, desc: messages.analysisMetricDescriptionTexture, val: result.metrics.texture },
                                  { name: messages.analysisMetricFirmness, desc: messages.analysisMetricDescriptionFirmness, val: result.metrics.firmness },
                                  { name: messages.analysisMetricBarrier, desc: messages.analysisMetricDescriptionBarrier, val: result.metrics.barrier },
                                  { name: messages.analysisMetricTone, desc: messages.analysisMetricDescriptionTone, val: result.metrics.tone },
                                ].map((m, i) => (
                                  <div key={i} className="p-3 bg-amber-50/30 rounded-xl border border-amber-100/50">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-black text-amber-900 uppercase tracking-wider">{m.name}</span>
                                      <span className="text-xs font-bold text-amber-600">{m.val}/100</span>
                                    </div>
                                    <p className="text-[10px] text-amber-800/70 leading-relaxed italic">{m.desc}</p>
                                  </div>
                                ))}
                              </motion.div>
                            ) : (
                              <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                  <Shield size={14} />
                                  {messages.analysisTrustTech}
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 leading-tight tracking-tight">
                                  {messages.analysisDetailedMetricsTitle}
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                         <Check size={20} />
                                      </div>
                                      <div>
                                         <div className="text-sm font-bold text-slate-900">{messages.analysisTrustSafe}</div>
                                         <div className="text-xs text-slate-500 font-medium tracking-tight italic">Validated against Fitzpatrick Type {result?.profile?.fitzpatrick_type}</div>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                                         <Award size={20} />
                                      </div>
                                      <div>
                                         <div className="text-sm font-bold text-slate-900">{messages.analysisTrustDermatologist}</div>
                                         <div className="text-xs text-slate-500 font-medium tracking-tight italic">Clinically verified Dubai-standard protocols</div>
                                      </div>
                                   </div>
                                </div>
                              </div>
                            )}
                        </div>
                     </div>
                 </div>
              ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16 px-2" />
              )}

              {result?.profile?.prognosis && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                      <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                          <div className="flex items-center gap-2 mb-3 text-red-700 font-bold">
                              <AlertTriangle size={20} />
                              <span>{messages.analysisWithoutCare}</span>
                          </div>
                          <p className="text-red-900/80 text-sm leading-relaxed">
                              {result.profile.prognosis.negative_scenario}
                          </p>
                      </div>
                      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                          <div className="flex items-center gap-2 mb-3 text-emerald-700 font-bold">
                              <TrendingUp size={20} />
                              <span>{messages.analysisWithCare}</span>
                          </div>
                          <p className="text-emerald-900/80 text-sm leading-relaxed">
                              {result.profile.prognosis.positive_scenario}
                          </p>
                      </div>
                  </div>
              )}

              {result?.active_ingredients && result.active_ingredients.length > 0 && (
                  <div className="mb-12">
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 px-2">
                        <Zap size={20} className="text-yellow-600" />
                        {messages.analysisActiveIngredientsTitle}
                      </h3>
                      <div className="flex flex-wrap gap-2 px-2 mb-4">
                          {result.active_ingredients.map((ing, i) => (
                              <span key={i} className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-xl text-sm font-bold border border-yellow-200 shadow-sm">
                                  {ing}
                              </span>
                          ))}
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-slate-700 mx-2">
                        <p className="font-medium mb-1">💡 {messages.analysisHowToSearchTitle}:</p>
                        <p>{messages.analysisHowToSearchBody}</p>
                      </div>
                  </div>
              )}

              {result?.clinicTreatments && result.clinicTreatments.length > 0 && (
                <div className="mb-16 mx-2 md:mx-0">
                    <div className="px-2 mb-8">
                        <h2 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">
                          {messages.analysisProfessionalCareTitle}
                        </h2>
                        <p className="text-slate-500 text-lg font-medium">
                          {messages.analysisProfessionalCareSubtitle}
                        </p>
                    </div>
                    
                    <div className="flex flex-col gap-6">
                        {/* 1. TOP RECOMMENDATION (Gold Frame) */}
                        {result.clinicTreatments && result.clinicTreatments[0] && (
                          <motion.div 
                             layout
                             className="relative group"
                          >
                             {/* Gold Glow Effect */}
                             <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-300 via-amber-500 to-amber-300 rounded-[2.5rem] blur opacity-30 group-hover:opacity-50 transition duration-1000" />
                             
                             <div className="relative bg-white rounded-[2.5rem] border-2 border-amber-400 shadow-2xl shadow-amber-200/40 overflow-hidden">
                                <div className="p-8 md:p-10">
                                   <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                      <div>
                                         <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-amber-100">
                                            <Star size={12} fill="currentColor" />
                                            {messages.analysisBestChoiceBadge}
                                         </div>
                                         <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                                            {result.clinicTreatments[0].name}
                                         </h3>
                                         <p className="text-slate-500 font-medium max-w-xl italic">
                                            {result.clinicTreatments[0].projected_improvement}
                                         </p>
                                      </div>
                                      
                                      <button 
                                         onClick={() => {
                                           const firstTreatment = result?.clinicTreatments?.[0];
                                           if (firstTreatment) handleBook(firstTreatment);
                                         }}
                                         className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white px-8 py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 active:scale-95"
                                      >
                                         <MessageCircle size={24} fill="currentColor" />
                                         {bookCtaLabel}
                                      </button>
                                   </div>

                                   {result.clinicTreatments[0].personalized_benefits && (
                                      <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50 flex items-start gap-4">
                                         <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                            <Sparkles className="text-amber-500" size={20} />
                                         </div>
                                         <div>
                                            <div className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-1">{messages.analysisWhyYouTitle}</div>
                                            <p className="text-slate-700 font-medium italic leading-relaxed">
                                               "{result.clinicTreatments[0].personalized_benefits}"
                                            </p>
                                         </div>
                                      </div>
                                   )}
                                </div>
                             </div>
                          </motion.div>
                        )}

                        {/* 2 & 3. ALTERNATIVES (Side-by-side) */}
                        {result.clinicTreatments && result.clinicTreatments.length > 1 && (
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {result.clinicTreatments.slice(1, 3).map((treatment: any, idx: number) => (
                                 <div 
                                    key={idx}
                                    className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-lg shadow-slate-200/30 flex flex-col justify-between"
                                 >
                                    <div>
                                       <h4 className="text-xl font-bold text-slate-900 mb-3">{treatment.name}</h4>
                                       <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 line-clamp-3">
                                          {treatment.projected_improvement}
                                       </p>
                                    </div>
                                    <button 
                                       onClick={() => {
                                          void trackProcedureInterest(treatment.name)
                                          handleBook(treatment)
                                       }}
                                       className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                                    >
                                       {messages.analysisMoreDetails}
                                       <ChevronRight size={16} />
                                    </button>
                                 </div>
                              ))}
                           </div>
                        )}
                    </div>
                </div>
              )}
              
              <SocialProofSection 
                clinicId={clinicId || resolveClientSlug()} 
                procedure={selectedProcedure || result?.clinicTreatments?.[0]?.name}
                locale={locale}
              />
              
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-6 md:p-10 text-center mb-12 border border-cyan-100">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{messages.analysisExpertSummaryTitle}</h3>
                <p className="text-slate-700 text-base md:text-lg font-medium leading-relaxed max-w-2xl mx-auto">
                  "{result?.closingAdvice}"
                </p>
              </div>

              <div className="bg-slate-900 rounded-3xl p-8 text-center text-white mb-24 md:mb-12 shadow-xl mx-2 md:mx-0">
                  <h3 className="text-2xl font-bold mb-4">{messages.analysisSaveResultTitle}</h3>
                  <p className="text-slate-300 mb-8 max-w-lg mx-auto">
                      {messages.analysisSaveResultSubtitle}
                  </p>
                  <button
                      onClick={() => router.push('/portal')}
                      className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 mx-auto"
                  >
                      <TrendingUp size={20} />
                      {messages.analysisTrackProgressButton}
                  </button>
              </div>
              
              <div className="text-center pb-24 md:pb-12 space-y-4">
                <button
                  onClick={onReset}
                  className="text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  {messages.analysisStartNewAnalysis}
                </button>

                {isDemoMode && (
                  <a
                    href="https://curescan.pro"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg"
                  >
                    <ArrowRight size={18} className="rotate-180" />
                    Back to Landing Page
                  </a>
                )}
              </div>
            </div>
          </div>
      </motion.div>
      )}
    </div>
  )
}
