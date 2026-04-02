'use client'

import React, { useEffect, useRef } from 'react'

type TurnstileProps = {
  siteKey: string
  onVerify: (token: string) => void
  onExpire?: () => void
  onError?: () => void
  className?: string
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, any>) => string
      remove: (widgetId: string) => void
      reset: (widgetId?: string) => void
    }
  }
}

let turnstileScriptPromise: Promise<void> | null = null

const loadTurnstileScript = () => {
  if (turnstileScriptPromise) return turnstileScriptPromise

  turnstileScriptPromise = new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return resolve()
    const existing = document.querySelector('script[data-turnstile]')
    if (existing) return resolve()

    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.turnstile = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile script failed to load'))
    document.head.appendChild(script)
  })

  return turnstileScriptPromise
}

export default function Turnstile({ siteKey, onVerify, onExpire, onError, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!siteKey || !containerRef.current) return

    let cancelled = false

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          'expired-callback': onExpire,
          'error-callback': onError
        })
      })
      .catch(() => {
        if (onError) onError()
      })

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [siteKey, onVerify, onExpire, onError])

  if (!siteKey) return null

  return <div ref={containerRef} className={className} />
}
