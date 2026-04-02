'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/diagnostic/branding/Header'
import DiagnosticTypeSwitcher from '@/components/diagnostic/branding/DiagnosticTypeSwitcher'
import UploadArea from '@/components/diagnostic/upload/UploadArea'
import AnalysisView from '@/components/diagnostic/analysis/AnalysisView'
import AnalysisViewAlt from '@/components/diagnostic/analysis/AnalysisViewAlt'
import PortalLoginModal from '@/components/portal/PortalLoginModal'
import { UploadedImage, LoadingState, AnalysisResult, DiagnosticType } from '@/lib/diagnostic/types'
import { analyzeHairImages } from '@/lib/diagnostic/aiService'
import { loadAnalysisResult, saveAnalysisResult, clearAnalysisResult } from '@/lib/diagnostic/storageService'
import { applyTheme } from '@/lib/diagnostic/theme'
import { DIAGNOSTIC_TYPES } from '@/config/diagnosticTypes'
import { getTrackingParams } from '@/lib/tracking'
import { DEFAULT_LOCALE, getCookie, getLocaleDir, pickLocale, setCookie, type Locale } from '@/lib/i18n'
import { getMessages } from '@/lib/i18n/messages'

export default function CheckupPage() {
  const router = useRouter()
  const [diagnosticType, setDiagnosticType] = useState<DiagnosticType>('skin')
  const [availableModules, setAvailableModules] = useState<string[] | null>(null) // null means loading
  const [clientName, setClientName] = useState('CureScan')
  const [clientTexts, setClientTexts] = useState<Record<string, string>>({})
  const [defaultPhoneCountry, setDefaultPhoneCountry] = useState<'RU' | 'AE'>('AE')
  const [defaultLocale, setDefaultLocale] = useState<Locale>(DEFAULT_LOCALE)
  const [supportedLocales, setSupportedLocales] = useState<Locale[]>([DEFAULT_LOCALE])
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE)
  const [leadUnlockMethod, setLeadUnlockMethod] = useState<'otp' | 'phone' | null>(null)
  const [primaryContactChannel, setPrimaryContactChannel] = useState<'whatsapp' | 'sms' | 'phone' | 'instagram' | null>(null)
  const [whatsappNumber, setWhatsappNumber] = useState<string | null>(null)
  const [instagramHandle, setInstagramHandle] = useState<string | null>(null)
  const [contactPhone, setContactPhone] = useState<string | null>(null)

  const [images, setImages] = useState<UploadedImage[]>([])
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isEmbedded, setIsEmbedded] = useState(false)

  // Tracking & Customer State
  const [trackingParams, setTrackingParams] = useState<any>({ source: 'direct', campaign: '' })
  const [customerId, setCustomerId] = useState<string | null>(null)
  const [clientSlug, setClientSlug] = useState<string>('default')
  const [clinicId, setClinicId] = useState<string | null>(null)
  const [isFollowupMode, setIsFollowupMode] = useState(false)
  const [useAltTemplate, setUseAltTemplate] = useState(false)

  // Portal Login Modal State
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false)

  // ============ AUTO-REDIRECT IF LOGGED IN ============
  useEffect(() => {
    const checkSession = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('force') === 'true') return; // Allow bypass

      const sessionToken = localStorage.getItem('customerSession');
      if (!sessionToken) return;

      try {
        const res = await fetch('/api/portal/verify-session', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${sessionToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (params.get('force') === 'true') {
            // If forced, just set the customerId and stay on page
            setCustomerId(data.customer.id);
            console.log('Session valid, customer identified:', data.customer.id);
          } else {
            // Otherwise redirect to portal
            console.log('Session valid, redirecting to portal...');
            router.push('/portal');
          }
        } else {
          localStorage.removeItem('customerSession');
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('customerSession');
      }
    };

    checkSession();
  }, [router]);

  // 1. Fetch Client Config on Mount
  useEffect(() => {
    setIsEmbedded(window.self !== window.top)
    
    // Capture UTMs using robust utility
    const fullTracking = getTrackingParams();
    setTrackingParams(fullTracking);
    
    async function fetchConfig() {
      try {
        // Pass current query params (like ?client=laserliks) to the API
        const searchParams = window.location.search
        const params = new URLSearchParams(searchParams);
        const cid = params.get('cid');
        const mode = params.get('mode');
        const alt = params.get('alt');
        
        if (cid) setCustomerId(cid);
        setIsFollowupMode(mode === 'followup')
        setUseAltTemplate(alt === 'true' || alt === '1')

        // For follow-up flows, never restore cached analysis (it causes stale/incorrect UX)
        if (mode === 'followup' || cid) {
          clearAnalysisResult()
          setResult(null)
          setImages([])
          setLoadingState(LoadingState.IDLE)
        }

        const res = await fetch(`/api/client-config${searchParams}`)
        if (res.ok) {
           const config = await res.json()
           if (config?.id) setClientSlug(config.id)
           if (typeof config?.clinicId === 'string') setClinicId(config.clinicId)
           setClientName(config.name)
           if (config.defaultCountry === 'AE' || config.defaultCountry === 'RU') {
             setDefaultPhoneCountry(config.defaultCountry)
           }
           if (config.defaultLocale === 'ru-RU' || config.defaultLocale === 'en-US' || config.defaultLocale === 'ar-AE') {
             // setDefaultLocale(config.defaultLocale) // Skip for demo
           }
           if (Array.isArray(config.supportedLocales)) {
             // const allowed = config.supportedLocales.filter((l: any) => l === 'ru-RU' || l === 'en-US' || l === 'ar-AE')
             // if (allowed.length > 0) setSupportedLocales(allowed) // Skip for demo
           } else if (config.defaultLocale === 'ru-RU' || config.defaultLocale === 'en-US' || config.defaultLocale === 'ar-AE') {
             // setSupportedLocales([config.defaultLocale]) // Skip for demo
           }
           
           if (config.texts) {
             setClientTexts(prev => ({ ...prev, ...config.texts })); // Merge to keep local overrides
           }

           if (config.leadUnlockMethod === 'otp' || config.leadUnlockMethod === 'phone') {
             // UAE pivot: avoid SMS OTP for now
             setLeadUnlockMethod(config.defaultCountry === 'AE' ? 'phone' : config.leadUnlockMethod)
           } else {
             // Sensible default for pilots: UAE => phone-only (WhatsApp-first), others => OTP
             setLeadUnlockMethod(config.defaultCountry === 'AE' ? 'phone' : 'otp')
           }

           if (config.primaryContactChannel === 'whatsapp' || config.primaryContactChannel === 'sms' || config.primaryContactChannel === 'phone' || config.primaryContactChannel === 'instagram') {
             setPrimaryContactChannel(config.primaryContactChannel)
           } else {
             setPrimaryContactChannel(config.defaultCountry === 'AE' ? 'whatsapp' : 'sms')
           }

           if (typeof config.whatsappNumber === 'string') setWhatsappNumber(config.whatsappNumber)
           if (typeof config.instagramHandle === 'string') setInstagramHandle(config.instagramHandle)
           if (typeof config.contactPhone === 'string') setContactPhone(config.contactPhone)
           
           if (config.modules && config.modules.length > 0) {
              setAvailableModules(config.modules)
              // Force the first module as active (e.g., 'skin')
              setDiagnosticType(config.modules[0] as DiagnosticType)
           } else {
              setAvailableModules(['skin'])
           }
           
           if (config.theme) {
             applyTheme(config.theme)
           }
        }
      } catch (e) {
        console.error("Failed to fetch client config", e)
        setClientSlug('default')
        setClinicId(null)
        setAvailableModules(['skin'])
      }
    }
    fetchConfig()
  }, [])

  // Resolve locale from query/cookie/clinic defaults once config is known
  useEffect(() => {
    if (!availableModules) return
    const params = new URLSearchParams(window.location.search)
    const requested = params.get('lang')
    const cookie = getCookie('cs_locale', document.cookie)

    const picked = pickLocale({
      requested,
      cookie,
      clinicDefault: defaultLocale,
      clinicSupported: supportedLocales
    })

    setLocale(picked)

    const dir = getLocaleDir(picked)
    document.documentElement.lang = picked
    document.documentElement.dir = dir
  }, [availableModules, defaultLocale, supportedLocales])

  const messages = getMessages(locale)
  const showLocaleSwitcher = supportedLocales.length > 1

  useEffect(() => {
    if (availableModules && availableModules.length > 1) {
        const config = DIAGNOSTIC_TYPES[diagnosticType]
        if (config) applyTheme(config.colors)
    }
  }, [diagnosticType, availableModules])


  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const cid = params.get('cid')
    const mode = params.get('mode')
    if (mode === 'followup' || cid) return

    const savedData = loadAnalysisResult()
    if (savedData) {
      setResult(savedData.result)
      setLoadingState(LoadingState.SUCCESS)
      
      // Restore images so FaceScanner can display them
      if (savedData.photos && savedData.photos.length > 0) {
          const recoveredImages: UploadedImage[] = savedData.photos.map((base64, index) => ({
              id: `recovered-${index}`,
              url: base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`,
              base64: base64.startsWith('data:') ? base64.split(',')[1] : base64,
              file: new File([], "recovered.jpg") // Dummy file to satisfy type
          }));
          setImages(recoveredImages);
      }
    }
  }, [])

  const handleDiagnosticTypeChange = (newType: DiagnosticType) => {
    if (newType !== diagnosticType) {
      setDiagnosticType(newType)
      setImages([])
      setResult(null)
      setLoadingState(LoadingState.IDLE)
      setError(null)
    }
  }

  const handleAnalyze = async () => {
    if (images.length === 0) return
      setLoadingState(LoadingState.ANALYZING)
      setError(null)
    try {
      const base64Images = images.map(img => img.base64)
      const analysisData = await analyzeHairImages(base64Images, diagnosticType, customerId || undefined, locale, trackingParams)
      setResult(analysisData)
      setLoadingState(LoadingState.SUCCESS)
      saveAnalysisResult(analysisData, images.map(img => img.base64))
    } catch (err: any) {
      setError(err.message || messages.checkupAnalyzeFailed)
      setLoadingState(LoadingState.ERROR)
    }
  }

  const handleReset = () => {

    setImages([])
    setResult(null)
    setLoadingState(LoadingState.IDLE)
    setError(null)
    clearAnalysisResult()
  }

  // Safety check if config isn't loaded yet or type is invalid
  const currentConfig = DIAGNOSTIC_TYPES[diagnosticType] || DIAGNOSTIC_TYPES.hair

  // Don't render until we know the configuration (to avoid flash of wrong content)
  if (!availableModules) {
      return <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
  }

  const showSwitcher = availableModules.length > 1

  return (
    <div className={`min-h-screen bg-white ${isEmbedded ? 'p-0' : ''}`}>
      {!isEmbedded && (
        <Header
          clientName={clientName}
          onPortalClick={() => setIsPortalModalOpen(true)}
          portalLabel={messages.portalButton}
          languageLabel={messages.languageLabel}
          locale={locale}
          locales={supportedLocales}
          onLocaleChange={(next) => {
            setLocale(next)
            setCookie('cs_locale', next)
            const dir = getLocaleDir(next)
            document.documentElement.lang = next
            document.documentElement.dir = dir
          }}
        />
      )}

      {/* Portal Login Modal */}
      <PortalLoginModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        clinicId={clinicId || clientSlug}
        locale={locale}
      />

      {/* Demo Banner REMOVED for Production Checkup Page */}

      {showSwitcher && (
        <div className={`${isEmbedded ? 'sticky top-0 z-40' : 'border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-16 z-40'}`}>
            <DiagnosticTypeSwitcher
            currentType={diagnosticType}
            onTypeChange={handleDiagnosticTypeChange}
            />
        </div>
      )}

      <main className={`container mx-auto px-4 ${isEmbedded ? 'py-4' : 'py-12'}`}>
        {loadingState === LoadingState.IDLE && !result && (
          <div className={`max-w-3xl mx-auto text-center ${isEmbedded ? 'mb-6' : 'mb-12'}`}>
            <h1 className={`font-bold text-slate-900 tracking-tight ${isEmbedded ? 'text-2xl mb-2' : 'text-4xl md:text-5xl mb-4'}`}>
              {clientTexts.title ||
                (isFollowupMode
                  ? messages.followupTitle
                  : diagnosticType === 'skin'
                    ? messages.checkupSkinTitle
                    : currentConfig.name)}
            </h1>
            <p className={`text-slate-500 ${isEmbedded ? 'text-sm' : 'text-lg'}`}>
              {clientTexts.subtitle ||
                (isFollowupMode
                  ? messages.followupSubtitle
                  : diagnosticType === 'skin'
                    ? messages.checkupSkinSubtitle
                    : messages.checkupUploadSubtitle)}
            </p>

            {!isFollowupMode && diagnosticType === 'skin' && !clientTexts.subtitle && (
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                {[
                  messages.checkupSkinFeatureSkinType,
                  messages.checkupSkinFeatureSkinScore,
                  messages.checkupSkinFeatureVisualAge,
                  messages.checkupSkinFeaturePlan,
                ].map((label) => (
                  <span
                    key={label}
                    className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 text-xs font-semibold"
                  >
                    {label}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {(loadingState === LoadingState.IDLE || loadingState === LoadingState.ERROR) && !result && (
          <div className={isEmbedded ? 'scale-95 origin-top transition-transform' : ''}>
            <UploadArea
              images={images}
              setImages={setImages}
              onAnalyze={handleAnalyze}
              isAnalyzing={false}
              uploadHint={clientTexts.uploadSubtitle || currentConfig.uploadHint}
              locale={locale}
            />
          </div>
        )}

        {loadingState === LoadingState.ERROR && error && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button onClick={handleReset} className="px-6 py-2 bg-red-600 text-white rounded-lg">
              {messages.checkupReset}
            </button>
          </div>
        )}

        {(loadingState === LoadingState.SUCCESS || loadingState === LoadingState.ANALYZING) && (
          <div className={isEmbedded ? 'scale-95 origin-top' : ''}>
            {useAltTemplate ? (
              <AnalysisView
                result={result}
                onReset={handleReset}
                diagnosticType={diagnosticType}
                userImage={images[0]?.url}
                isLoading={loadingState === LoadingState.ANALYZING}
                trackingParams={trackingParams}
                images={images.map(img => img.base64)}
                clientSlug={clientSlug}
                clinicId={clinicId || undefined}
                defaultPhoneCountry={defaultPhoneCountry}
                locale={locale}
                leadUnlockMethod={leadUnlockMethod || undefined}
                primaryContactChannel={primaryContactChannel || undefined}
                whatsappNumber={whatsappNumber || undefined}
                instagramHandle={instagramHandle || undefined}
                contactPhone={contactPhone || undefined}
                isDemoMode={clientSlug.startsWith('demo')}
              />
            ) : (
              <AnalysisViewAlt
                result={result}
                onReset={handleReset}
                diagnosticType={diagnosticType}
                userImage={images[0]?.url}
                isLoading={loadingState === LoadingState.ANALYZING}
                trackingParams={trackingParams}
                images={images.map(img => img.base64)}
                clientSlug={clientSlug}
                clinicId={clinicId || undefined}
                defaultPhoneCountry={defaultPhoneCountry}
                locale={locale}
                leadUnlockMethod={leadUnlockMethod || undefined}
                primaryContactChannel={primaryContactChannel || undefined}
                whatsappNumber={whatsappNumber || undefined}
                instagramHandle={instagramHandle || undefined}
                contactPhone={contactPhone || undefined}
                isDemoMode={clientSlug.startsWith('demo')}
              />
            )}
          </div>
        )}
      </main>

      {!isEmbedded && (
        <footer className="border-t border-slate-100 py-8 mt-12">
          <div className="max-w-5xl mx-auto px-4 text-center text-slate-400 text-sm">
            <p>© {new Date().getFullYear()} CureScan.pro</p>
          </div>
        </footer>
      )}
    </div>
  )
}
