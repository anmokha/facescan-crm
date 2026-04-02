'use client'

import React from 'react'
import { ExternalLink, Sparkles } from 'lucide-react'

export default function InteractiveDemoSection() {
  const handleOpenDemo = () => {
    window.open('https://demo-widget.curescan.pro', '_blank')
  }

  return (
    <section id="demo" className="py-24 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
                <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full mb-6">
                    <span className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></span>
                    <span className="text-sm font-bold tracking-tight uppercase">Interactive Demo</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
                    Try the technology in action right now
                </h2>
                <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                    Our AI analyzes the photo, identifies the problem, and selects services from your price list.
                    Test the demo interface in a new window.
                </p>

                <div className="space-y-8">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
                             <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-2">AI Visualization</h4>
                            <p className="text-slate-600">Instant condition analysis from a photo with medical-grade precision.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
                             <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-2">Your Price List</h4>
                            <p className="text-slate-600">The system recommends YOUR specific services based on identified issues.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
                             <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-slate-900 mb-2">Qualified Lead</h4>
                            <p className="text-slate-600">You get not just a contact, but a warmed-up client who understands their needs.</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Demo Widget Container - Clickable */}
            <div
                onClick={handleOpenDemo}
                className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative cursor-pointer group hover:shadow-3xl transition-all duration-300 hover:scale-[1.02]"
            >
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-xs font-mono text-slate-400">demo-widget.curescan.pro</div>
                </div>

                <div className="p-6 md:p-8 min-h-[500px] flex flex-col items-center justify-center relative">
                    {/* Click to open overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative z-10 text-center space-y-6">
                        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300">
                            <Sparkles className="w-12 h-12 text-white" />
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                Try Live Demo
                            </h3>
                            <p className="text-lg text-slate-600 max-w-md mx-auto">
                                Upload a photo and see instant AI-powered skin analysis with personalized recommendations
                            </p>
                        </div>

                        <div className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg group-hover:shadow-2xl">
                            <ExternalLink size={20} />
                            Open Interactive Demo
                        </div>

                        <p className="text-xs text-slate-400">
                            Opens in a new tab • No registration required
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  )
}
