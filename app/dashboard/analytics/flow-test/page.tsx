'use client'

import React from 'react'
import { LeadStreamChart, FlowData } from '@/components/dashboard/analytics/LeadStreamChart'

const mockData: FlowData = {
  sources: [
    { id: 'insta', name: 'Instagram Ads', value: 450, color: '#E1306C' },
    { id: 'google', name: 'Google Search', value: 280, color: '#4285F4' },
    { id: 'tiktok', name: 'TikTok Organic', value: 190, color: '#000000' },
    { id: 'qr', name: 'QR Reception', value: 120, color: '#10B981' },
    { id: 'other', name: 'Direct/Other', value: 60, color: '#64748B' },
  ],
  targets: [
    { id: 'won', name: 'Paid', value: 180, color: '#10B981' },
    { id: 'active', name: 'In Progress', value: 420, color: '#3B82F6' },
    { id: 'lost', name: 'Lost', value: 500, color: '#EF4444' },
  ],
  links: [
    { sourceId: 'insta', targetId: 'won', value: 50 },
    { sourceId: 'insta', targetId: 'active', value: 150 },
    { sourceId: 'insta', targetId: 'lost', value: 250 },
    { sourceId: 'google', targetId: 'won', value: 60 },
    { sourceId: 'google', targetId: 'active', value: 120 },
    { sourceId: 'tiktok', targetId: 'won', value: 30 },
    { sourceId: 'tiktok', targetId: 'active', value: 80 },
    { sourceId: 'qr', targetId: 'won', value: 40 },
    { sourceId: 'other', targetId: 'lost', value: 60 },
  ]
}

export default function FlowTestPage() {
  return (
    <div className="p-10 bg-[#06080F] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">LeadStream Visualizer</h1>
            <p className="text-slate-500 text-lg">Experimental traffic flow visualization in a Wormhole style.</p>
        </header>

        <div className="mb-10">
            <LeadStreamChart data={mockData} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <h3 className="font-bold mb-2">Gradient Links</h3>
                <p className="text-sm text-slate-400">Lines smoothly transition from source color to outcome, creating a pulsing effect.</p>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <h3 className="font-bold mb-2">Interactive Focus</h3>
                <p className="text-sm text-slate-400">Hover a source or status to highlight a specific money path.</p>
            </div>
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <h3 className="font-bold mb-2">Enterprise Ready</h3>
                <p className="text-sm text-slate-400">Looks premium and tech-forward, great for clinic owner presentations.</p>
            </div>
        </div>
      </div>
    </div>
  )
}
