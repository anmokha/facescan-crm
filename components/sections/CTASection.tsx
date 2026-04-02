'use client'

import React, { useState } from 'react'

export default function CTASection() {
  return (
    <section id="contact" className="py-24 bg-blue-600 text-white relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
            <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
            </svg>
        </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight">
          Ready to Grow Your Clinic?
        </h2>
        <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
          Start with a performance pilot. Prove the value of AI diagnostics on your own leads.
        </p>

        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-2xl text-slate-900 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-6">Book a 1-Month Discovery Pilot</h3>
            
            <div className="space-y-4 mb-8 text-left">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-slate-700 font-medium">Full Setup & Localization</span>
                </div>
                 <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-slate-700 font-medium">Your Services & Pricing</span>
                </div>
                 <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-slate-700 font-medium">Custom Performance Terms</span>
                </div>
            </div>

            <a 
                href="https://calendly.com/curescan-pro/15min" 
                target="_blank"
                rel="noreferrer"
                className="block w-full py-4 text-xl font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl mb-4"
            >
                Book Discovery Call
            </a>
            <p className="text-sm text-slate-500">
                Or contact us via <a href="https://wa.me/971501234567" className="text-blue-600 font-bold underline">WhatsApp</a> for a quick chat.
            </p>
        </div>
      </div>
    </section>
  )
}