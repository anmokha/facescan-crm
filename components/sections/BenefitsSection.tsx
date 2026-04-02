'use client'

import React from 'react'

export default function BenefitsSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Why Clinics Choose CureScan
            </h2>
            <p className="text-xl text-slate-600">
            A tool that makes your marketing smarter and sales easier.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Benefit 1 */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Deep Analytics</h3>
            <p className="text-slate-600 leading-relaxed">
              You know everything about the client before the first visit: skin type, age, acne severity. 
              This allows your admin to call with a specific offer rather than a "cold" script.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Upsell</h3>
            <p className="text-slate-600 leading-relaxed">
              AI doesn't just find the problem, it immediately suggests a solution from your price list. 
              Client sees: "You have wrinkles &rarr; You need Botox ($300)". The sale is made on the site.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Retargeting</h3>
            <p className="text-slate-600 leading-relaxed">
              Collect a database of medical profiles, not just phone numbers. 
              Launch targeted campaigns: "Discount on cleaning for oily skin" or "Lifting for 45+".
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
