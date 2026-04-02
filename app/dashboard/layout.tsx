'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, Link as LinkIcon, BarChart3, Settings, LogOut, Users, Webhook, GraduationCap, Contact } from 'lucide-react'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { auth } from '@/lib/diagnostic/firebaseConfig'
import { getClinicSettings } from '@/lib/diagnostic/dashboardService'
import { getMessages } from '@/lib/i18n/messages'
import { getLocaleDir, isSupportedLocale, type Locale } from '@/lib/i18n'
import { DashboardI18nProvider } from '@/lib/i18n/dashboard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading: authLoading } = useAuth()
  const [clinicLoading, setClinicLoading] = useState(true)
  const [leadsCount, setLeadsCount] = useState(0)
  const [leadsLimit, setLeadsLimit] = useState(50)
  const [locale, setLocale] = useState<Locale>('en-US')
  const [needsWhatsApp, setNeedsWhatsApp] = useState(false)
  const [needsPriceList, setNeedsPriceList] = useState(false)

  const router = useRouter()
  const pathname = usePathname()
  const messages = getMessages(locale)
  const dir = getLocaleDir(locale)

  useEffect(() => {
    async function checkClinic() {
      if (authLoading) return
      if (!user) {
        router.push('/login')
        return
      }

      const clinicId = user.uid
      try {
        const settings = await getClinicSettings(clinicId)

        if (!settings) {
          router.push('/onboarding')
        } else {
          if (settings.limits?.leads) setLeadsLimit(settings.limits.leads)
          setLeadsCount(settings.leadCount ?? 0)
          if (isSupportedLocale(settings.defaultLocale)) setLocale(settings.defaultLocale)
          setNeedsWhatsApp(!settings.whatsappNumber)
          setNeedsPriceList((settings.services?.length || 0) === 0)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setClinicLoading(false)
      }
    }
    checkClinic()
  }, [user, authLoading, router])

  const handleLogout = async () => {
    await auth.signOut()
    router.push('/login')
  }

  if (authLoading || clinicLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user) return null

  const navItems = [
    { name: messages.dashboardOverview, href: '/dashboard', icon: LayoutDashboard },
    { name: messages.dashboardSources, href: '/dashboard/sources', icon: LinkIcon },
    { name: messages.dashboardLeads, href: '/dashboard/leads', icon: Users },
    { name: messages.dashboardCustomers, href: '/dashboard/customers', icon: Contact },
    { name: messages.dashboardAnalytics, href: '/dashboard/analytics', icon: BarChart3 },
    { name: messages.dashboardAcademy, href: '/dashboard/academy', icon: GraduationCap },
    { name: messages.dashboardIntegrations, href: '/dashboard/settings/integrations', icon: Webhook },
    { name: messages.dashboardSettings, href: '/dashboard/settings', icon: Settings },
  ]

  return (
    <DashboardI18nProvider locale={locale}>
    <div className="flex h-screen bg-slate-50" dir={dir}>
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            CureScan Admin
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive 
                    ? 'bg-slate-800 text-cyan-400 font-medium' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          {/* Usage Meter */}
          <div className="mb-6 px-4">
              <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500 mb-2">
                  <span>{messages.dashboardUsage}</span>
                  <span className={leadsCount >= leadsLimit ? 'text-red-500' : 'text-slate-400'}>
                      {leadsCount} / {leadsLimit}
                  </span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                        leadsCount >= leadsLimit ? 'bg-red-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.min((leadsCount / leadsLimit) * 100, 100)}%` }}
                  />
              </div>
              {leadsCount >= leadsLimit && (
                  <p className="text-[10px] text-red-400 mt-2 font-medium">{messages.dashboardLimitReached}</p>
              )}
          </div>

          <div className="flex items-center gap-3 px-4 py-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center font-bold text-xs">
                {user.email?.substring(0,2).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-slate-500">{messages.dashboardProPlan}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg text-sm transition-colors"
          >
            <LogOut size={16} /> {messages.dashboardLogout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          {(needsWhatsApp || needsPriceList) && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {needsWhatsApp && (
                <Link
                  href="/dashboard/settings#whatsapp"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors"
                >
                  [Add WhatsApp]
                </Link>
              )}
              {needsPriceList && (
                <Link
                  href="/dashboard/settings#services"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors"
                >
                  [Upload Price List]
                </Link>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
    </DashboardI18nProvider>
  )
}
