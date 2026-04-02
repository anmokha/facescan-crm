export type Locale = 'ru-RU' | 'en-US' | 'ar-AE'

export const DEFAULT_LOCALE: Locale = 'en-US'

export function isSupportedLocale(value: unknown): value is Locale {
  return value === 'ru-RU' || value === 'en-US' || value === 'ar-AE'
}

export function getLocaleDir(locale: Locale): 'ltr' | 'rtl' {
  return locale.startsWith('ar') ? 'rtl' : 'ltr'
}

export function pickLocale(input: {
  requested?: string | null
  cookie?: string | null
  clinicDefault?: string | null
  clinicSupported?: string[] | null
}): Locale {
  const supported = (input.clinicSupported || []).filter(isSupportedLocale)
  const clinicDefault = isSupportedLocale(input.clinicDefault) ? input.clinicDefault : DEFAULT_LOCALE

  const normalizeCandidate = (v: string | null | undefined): Locale | null => {
    if (!v) return null
    return isSupportedLocale(v) ? v : null
  }

  const requested = normalizeCandidate(input.requested)
  const cookie = normalizeCandidate(input.cookie)

  const isAllowed = (loc: Locale) => (supported.length ? supported.includes(loc) : true)

  if (requested && isAllowed(requested)) return requested
  if (cookie && isAllowed(cookie)) return cookie
  if (isAllowed(clinicDefault)) return clinicDefault

  return DEFAULT_LOCALE
}

export function getCookie(name: string, cookieString: string): string | null {
  const prefix = `${name}=`
  const parts = cookieString.split(';')
  for (const part of parts) {
    const trimmed = part.trim()
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length))
    }
  }
  return null
}

export function setCookie(name: string, value: string, maxAgeSeconds: number = 60 * 60 * 24 * 365) {
  if (typeof document === 'undefined') return
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`
}

