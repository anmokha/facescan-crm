'use client'

import React from 'react'

export default function ProblemSection() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Stop losing leads due to generic offers
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Standard ads just bring you phone numbers. Your admin spends hours calling, 
            without knowing what the client actually needs. It's expensive and inefficient.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* OLD WAY */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 opacity-60 grayscale-[50%] hover:grayscale-0 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-400">Standard Lead</h3>
              <span className="text-sm font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">Old Way</span>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3 text-slate-500">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                <span>Skin type? Unknown</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-500">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                <span>Acne or Pigmentation? Unknown</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-500">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                <span>Budget ready? Unknown</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <p className="text-slate-600 italic">"The admin offers 'everything', the client gets annoyed and leaves."</p>
            </div>
          </div>

          {/* NEW WAY */}
          <div className="bg-white rounded-3xl p-8 border-2 border-blue-600 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
              RECOMMENDED
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">CureScan Lead</h3>
              <span className="text-sm font-semibold bg-blue-50 text-blue-600 px-3 py-1 rounded-full">New Way</span>
            </div>
            
            <div className="space-y-4 mb-8">
               {/* AI Data Card */}
               <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                    <div className="text-xs text-blue-400 font-bold uppercase mb-1">AI Data</div>
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs bg-white text-slate-700 px-2 py-1 rounded border border-slate-200 font-medium">Acne: Moderate</span>
                        <span className="text-xs bg-white text-slate-700 px-2 py-1 rounded border border-slate-200 font-medium">Pores: Visible</span>
                        <span className="text-xs bg-slate-800 text-white px-2 py-1 rounded border border-slate-600">Oily Skin</span>
                    </div>
               </div>

              <div className="flex items-center space-x-3 text-slate-700 font-medium">
                <svg className="w-5 h-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Personalized Offer (Deep Clean + Peel)</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-700 font-medium">
                <svg className="w-5 h-5 flex-shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <span>Context for WhatsApp Conversation</span>
              </div>
            </div>

            <div className="bg-blue-600 rounded-xl p-4 text-white shadow-lg shadow-blue-200">
              <p className="font-medium">You call with a ready solution. Booking conversion triples.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}