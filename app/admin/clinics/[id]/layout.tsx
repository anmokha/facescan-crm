'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Settings, ArrowLeft } from 'lucide-react'

export default function ClinicLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: { id: string }
}) {
  const pathname = usePathname()
  const baseUrl = `/admin/clinics/${params.id}`

  const tabs = [
      { name: 'Analytics', href: `${baseUrl}/dashboard`, icon: LayoutDashboard },
      { name: 'Settings', href: `${baseUrl}/settings`, icon: Settings },
  ]

  return (
    <div className="flex flex-col h-full">
        {/* Clinic Context Header */}
        <div className="bg-slate-950 border-b border-slate-800 px-8 py-4 flex items-center gap-6 sticky top-0 z-40">
            <Link href="/admin" className="text-slate-500 hover:text-white transition-colors">
                <ArrowLeft size={20} />
            </Link>
            
            <div className="h-6 w-px bg-slate-800"></div>

            <div className="flex items-center gap-1">
                {tabs.map(tab => {
                    const isActive = pathname === tab.href
                    const Icon = tab.icon
                    return (
                        <Link 
                            key={tab.href}
                            href={tab.href}
                            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                                isActive 
                                    ? 'bg-slate-800 text-white shadow-sm' 
                                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                            }`}
                        >
                            <Icon size={16} />
                            {tab.name}
                        </Link>
                    )
                })}
            </div>
        </div>

        <div className="flex-grow bg-slate-950">
            {children}
        </div>
    </div>
  )
}
