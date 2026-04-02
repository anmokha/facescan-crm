'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import { Zap, AlertTriangle } from 'lucide-react'

export default function SubscriptionWidget() {
    const { user } = useAuth()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return
        
        user.getIdToken().then((token) => {
            return fetch(`/api/dashboard/subscription-status?clinicId=${user.uid}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        })
            .then(res => res.json())
            .then(setData)
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [user])

    if (loading || !data) return null;

    // Don't show for paid plans (unless close to limit?)
    if (data.isUnlimited) {
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-500/20">
                <Zap size={14} /> PRO PLAN
            </div>
        )
    }

    const percent = Math.min(100, (data.usage / data.limit) * 100);
    const isCritical = percent >= 90;

    return (
        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm min-w-[140px]">
            <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{data.plan.toUpperCase()}</span>
                    <span className={`text-[10px] font-bold ${isCritical ? 'text-red-500' : 'text-slate-700'}`}>
                        {data.usage} / {data.limit}
                    </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                            isCritical ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${percent}%` }}
                    />
                </div>
            </div>
            
            {isCritical && (
                <div className="text-red-500 animate-pulse" title="Limit reached soon!">
                    <AlertTriangle size={16} />
                </div>
            )}
        </div>
    )
}
