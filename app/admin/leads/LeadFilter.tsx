'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Building2 } from 'lucide-react'

export default function LeadFilter({ clinics }: { clinics: any[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentClinic = searchParams.get('clinic') || 'all'

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        if (val === 'all') {
            router.push('/admin/leads')
        } else {
            router.push(`/admin/leads?clinic=${val}`)
        }
    }

    return (
        <div className="flex items-center gap-3 bg-slate-900 p-2 rounded-xl border border-slate-800">
            <Building2 size={18} className="text-slate-500 ml-2" />
            <select 
                value={currentClinic}
                onChange={handleChange}
                className="bg-transparent text-white border-none focus:ring-0 text-sm font-bold pr-8 cursor-pointer"
            >
                <option value="all">All Clinics</option>
                {clinics.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                ))}
            </select>
        </div>
    )
}
