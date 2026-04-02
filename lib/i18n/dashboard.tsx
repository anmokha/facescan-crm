'use client'

import React, { createContext, useContext, useMemo } from 'react'
import type { Locale } from '@/lib/i18n'
import { getLocaleDir } from '@/lib/i18n'
import { getMessages, type Messages } from '@/lib/i18n/messages'

type DashboardI18nValue = {
  locale: Locale
  dir: 'ltr' | 'rtl'
  messages: Messages
}

const DashboardI18nContext = createContext<DashboardI18nValue | null>(null)

export function DashboardI18nProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  const value = useMemo<DashboardI18nValue>(() => {
    return { locale, dir: getLocaleDir(locale), messages: getMessages(locale) }
  }, [locale])

  return <DashboardI18nContext.Provider value={value}>{children}</DashboardI18nContext.Provider>
}

export function useDashboardI18n(): DashboardI18nValue {
  const value = useContext(DashboardI18nContext)
  if (!value) throw new Error('useDashboardI18n must be used within DashboardI18nProvider')
  return value
}

export function useDashboardI18nOptional(): DashboardI18nValue | null {
  return useContext(DashboardI18nContext)
}
