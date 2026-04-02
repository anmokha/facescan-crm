'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Search, ChevronDown, Building2, Check } from 'lucide-react'

export default function ClinicSwitcher({ clinics }: { clinics: any[] }) {
    const router = useRouter()
    const params = useParams()
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')

    const currentClinicId = params.id as string
    const currentClinic = clinics.find(c => c.id === currentClinicId)

    const filteredClinics = clinics.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.slug.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="relative mb-6">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-all text-left"
            >
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-900/20">
                    <Building2 size={16} />
                </div>
                <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-1">Active Context</p>
                    <p className="text-sm font-bold text-white truncate">
                        {currentClinic ? currentClinic.name : 'All Clinics'}
                    </p>
                </div>
                <ChevronDown size={16} className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-slate-800">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input 
                                type="text"
                                className="w-full bg-slate-950 border-none rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:ring-1 focus:ring-blue-500"
                                placeholder="Search clinic..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-1">
                        <button 
                            onClick={() => {
                                router.push('/admin/leads')
                                setIsOpen(false)
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors text-xs font-medium text-slate-400 hover:text-white"
                        >
                            <span>Global View (All)</span>
                            {!currentClinicId && <Check size={14} className="text-blue-500" />}
                        </button>
                        <div className="h-px bg-slate-800 my-1 mx-2" />
                        {filteredClinics.map(clinic => (
                            <button 
                                key={clinic.id}
                                onClick={() => {
                                    router.push(`/admin/clinics/${clinic.id}/dashboard`)
                                    setIsOpen(false)
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-xs ${
                                    currentClinicId === clinic.id 
                                        ? 'bg-blue-600/10 text-blue-400' 
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <span className="truncate">{clinic.name}</span>
                                {currentClinicId === clinic.id && <Check size={14} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
