import React, { useMemo, useState } from 'react'
import { Lock, ChevronRight } from 'lucide-react'
import { normalizePhone, type SupportedCountry } from '@/lib/phone'
import type { Locale } from '@/lib/i18n'
import { getMessages } from '@/lib/i18n/messages'

interface PhoneGateProps {
  onUnlock: (payload: {
    phone: string
    phoneCountry: SupportedCountry
    captchaToken?: string | null
    honeypot?: string
    formStartedAt?: number
    whatsappOptIn?: boolean
  }) => void
  isLoading: boolean
  defaultPhoneCountry?: SupportedCountry
  allowCountrySelect?: boolean
  locale?: Locale
  captchaProvider?: 'turnstile' | 'recaptcha' | 'none'
  turnstileSiteKey?: string
  recaptchaSiteKey?: string
}

export default function PhoneGate({
  onUnlock,
  isLoading,
  defaultPhoneCountry = 'AE',
  allowCountrySelect = true,
  locale = 'en-US',
  captchaProvider = 'none',
  turnstileSiteKey,
  recaptchaSiteKey
}: PhoneGateProps) {
  const messages = getMessages(locale)
  const [phoneCountry, setPhoneCountry] = useState<SupportedCountry>(defaultPhoneCountry)
  const [phone, setPhone] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [formStartedAt] = useState(() => Date.now())
  const [error, setError] = useState<string | null>(null)
  const [whatsappOptIn, setWhatsappOptIn] = useState(false)

  const normalized = useMemo(() => {
    try {
      if (!phone.trim()) return null
      return normalizePhone(phone, phoneCountry)
    } catch {
      return null
    }
  }, [phone, phoneCountry])

  const isValid = Boolean(normalized)

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('PhoneGate: handleSubmit triggered');
    e.preventDefault()
    setError(null)
    console.log('PhoneGate: normalized value:', normalized);
    if (!normalized) {
      console.log('PhoneGate: validation failed');
      setError(messages.invalidPhone)
      return
    }

    onUnlock({
      phone: normalized.phoneE164,
      phoneCountry,
      captchaToken: captchaToken,
      honeypot,
      formStartedAt,
      whatsappOptIn
    })
  }

  return (
    <div className="bg-white/90 backdrop-blur-md p-8 rounded-[2rem] shadow-2xl max-w-md w-full border border-white/50 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-200">
        <Lock className="text-white" size={32} />
      </div>

      <h3 className="text-2xl font-bold text-slate-900 mb-2">{messages.unlockTitle}</h3>
      <p className="text-slate-600 mb-8 leading-relaxed">{messages.unlockSubtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium text-center focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all placeholder:text-slate-400"
          placeholder="+971 50 123 4567"
          disabled={isLoading}
        />

        {/* WhatsApp Opt-in Checkbox */}
        <label className="flex items-start gap-3 text-left text-sm text-slate-700 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer">
          <input
            type="checkbox"
            checked={whatsappOptIn}
            onChange={(e) => setWhatsappOptIn(e.target.checked)}
            className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
            disabled={isLoading}
          />
          <span>
            <span className="font-semibold text-slate-900">
              {messages.whatsappOptInLabel || 'I agree to be contacted on WhatsApp regarding my results and booking.'}
            </span>
            <span className="block text-xs text-slate-600 mt-1">
              {messages.whatsappOptInBenefit || '→ So we can send your summary & available slots on WhatsApp.'}
            </span>
            <span className="block text-xs text-slate-500 mt-0.5">
              {messages.whatsappOptInDisclaimer || '→ No spam. Opt out anytime.'}
            </span>
          </span>
        </label>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="absolute left-[-9999px] top-auto w-1 h-1 overflow-hidden" aria-hidden="true">
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            name="company"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-slate-200/50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              {messages.unlockButton || 'Unlock result'}
              <ChevronRight size={20} />
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-slate-400 mt-6">{messages.unlockConsent}</p>
    </div>
  )
}
