'use client'

type GrecaptchaV3 = {
  execute: (siteKey: string, options: { action: string }) => Promise<string>
  ready: (cb: () => void) => void
}

declare global {
  interface Window {
    grecaptcha?: GrecaptchaV3
  }
}

let recaptchaScriptPromise: Promise<void> | null = null

export const loadRecaptchaV3 = (siteKey: string) => {
  if (recaptchaScriptPromise) return recaptchaScriptPromise

  recaptchaScriptPromise = new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return resolve()
    if (!siteKey) return reject(new Error('Missing reCAPTCHA site key'))

    const existing = document.querySelector('script[data-recaptcha-v3]')
    if (existing) return resolve()

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true
    script.dataset.recaptchaV3 = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('reCAPTCHA v3 script failed to load'))
    document.head.appendChild(script)
  })

  return recaptchaScriptPromise
}

export const executeRecaptchaV3 = async (siteKey: string, action: string) => {
  await loadRecaptchaV3(siteKey)

  if (!window.grecaptcha) {
    throw new Error('reCAPTCHA is not available')
  }

  return new Promise<string>((resolve, reject) => {
    window.grecaptcha?.ready(() => {
      window.grecaptcha
        ?.execute(siteKey, { action })
        .then(resolve)
        .catch(reject)
    })
  })
}
