'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ShieldAlert, Loader2, Users, FileText, Activity, LayoutDashboard, Building2, BarChart3, Brain } from 'lucide-react'
import ClinicSwitcher from '@/components/admin/ClinicSwitcher'

const NAV_ITEMS = [
    { href: '/admin', label: 'Overview', icon: LayoutDashboard },
    { href: '/admin/clinics', label: 'Clinics', icon: Building2 },
    { href: '/admin/tds', label: 'TDS Tracker', icon: BarChart3 },
    { href: '/admin/leads', label: 'Leads', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/ai-stats', label: 'AI Статистика', icon: Brain },
    { href: '/admin/audit', label: 'Audit Logs', icon: FileText },
    { href: '/admin/logs', label: 'AI Logs', icon: Activity },
    { href: '/admin/users', label: 'Admin Users', icon: ShieldAlert },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [adminClaims, setAdminClaims] = useState<any>(null)
  const [clinics, setClinics] = useState<any[]>([])

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/admin')
      } else {
        // Check custom claims instead of hardcoded list
        user.getIdTokenResult().then(idTokenResult => {
          const claims = idTokenResult.claims;

          if (claims.admin === true) {
            setAdminClaims(claims);
            setIsAuthorized(true);

            // Load clinics list for the switcher
            user.getIdToken().then(token => {
              fetch('/api/admin/clinics', {
                headers: {
                  'Authorization': `Bearer ${token}`
                }
              })
                .then(res => res.json())
                .then(data => Array.isArray(data) && setClinics(data))
                .catch(err => console.error("Switcher load error", err))
            });
          } else {
            setIsAuthorized(false);
          }
        }).catch(error => {
          console.error('Failed to get claims:', error);
          setIsAuthorized(false);
        });
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="text-blue-600 animate-spin" size={48} />
        </div>
    )
  }

  if (user && !isAuthorized) {
      return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
              <div className="max-w-md text-center">
                  <ShieldAlert size={64} className="mx-auto text-red-500 mb-6" />
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
                  <p className="text-gray-600 mb-6">You do not have permission to view the Admin panel.</p>
                  <button onClick={() => router.push('/')} className="text-blue-600 hover:text-blue-700 font-medium transition-colors">Go Home</button>
              </div>
          </div>
      )
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col sticky top-0 h-screen">
        <div className="mb-8 flex items-center gap-2 text-blue-600 font-bold text-xl tracking-tight">
            <ShieldAlert />
            Admin Panel
        </div>

        {/* NEW CLINIC SWITCHER */}
        <ClinicSwitcher clinics={clinics} />

        <nav className="space-y-2 flex-1">
            {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
                const Icon = item.icon;

                return (
                    <Link
                        key={item.href}
                        href={item.href}
                        prefetch
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                            isActive
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                    >
                        <Icon size={18} />
                        {item.label}
                    </Link>
                )
            })}
        </nav>

        <div className="pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-widest">Admin</div>
            <div className="text-sm font-bold truncate text-gray-900">{user.email}</div>
            <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 w-full text-xs bg-gray-100 border border-gray-200 hover:bg-gray-200 hover:border-gray-300 py-2 rounded-lg transition-colors text-gray-700 font-medium"
            >
                Return to My Dash
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
