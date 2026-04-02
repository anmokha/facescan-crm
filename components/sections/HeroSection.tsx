'use client'

import React from 'react'
import Image from 'next/image'
import Button from '@/components/ui/Button'

export default function HeroSection() {
  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative bg-white border-b border-slate-200 py-6 md:py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-16 md:mb-24">
            <div className="flex items-center gap-2">
                <Image
                  src="/curescanlogo.png"
                  alt="CureScan.pro"
                  width={48}
                  height={48}
                  quality={100}
                  className="h-12 w-12 shrink-0 object-cover"
                  priority
                />
                <span className="text-xl font-bold text-slate-900 tracking-tight">CureScan.pro</span>
            </div>
            <div className="flex items-center gap-3">
                <a 
                    href="/login" 
                    className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors"
                >
                    Log In
                </a>
                <a 
                    href="https://calendly.com/curescan-pro/15min" 
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                >
                    Book a Call
                </a>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column: Content */}
          <div className="relative z-10">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg mb-8 border border-blue-100">
              <span className="text-sm font-bold tracking-tight uppercase">Clinic Growth Tool</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-[1.1]">
              Launch an <span className="text-blue-600">online checkup</span> on your site and convert visitors into patients
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-700 mb-10 leading-relaxed max-w-2xl">
              Don't just collect phone numbers—get a detailed skin analysis for every lead. 
              Use AI data to segment your database and send **personalized offers** that match the client's exact needs.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <a 
                href="https://calendly.com/curescan-pro/15min" 
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-black text-white bg-blue-600 rounded-xl hover:bg-blue-700 hover:-translate-y-0.5 transition-all shadow-xl shadow-blue-600/30"
              >
                Book Discovery Call
              </a>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg font-black border-slate-300 text-slate-700 hover:bg-slate-50" onClick={scrollToDemo}>
                Try Demo Checkup
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-slate-600">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="font-semibold leading-tight">Launch in 14 days</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-semibold leading-tight">White-label Solution</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-semibold leading-tight">Conversion Analytics</span>
              </div>
            </div>
          </div>

          {/* Right Column: Smartphone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative w-[300px] h-[600px] bg-slate-900 rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden">
              {/* Speaker */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-20"></div>
              
              {/* Inner Screen Content */}
              <div className="relative h-full w-full bg-white flex flex-col p-6 pt-12">
                <div className="flex items-center justify-between mb-8">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">CS</div>
                  <div className="flex gap-1">
                    <div className="w-4 h-1 bg-slate-200 rounded-full"></div>
                    <div className="w-4 h-1 bg-slate-200 rounded-full"></div>
                    <div className="w-4 h-1 bg-blue-600 rounded-full"></div>
                  </div>
                </div>

                <div className="flex-grow flex flex-col items-center justify-center text-center">
                  <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border-2 border-green-100 animate-pulse">
                    <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">Analysis Ready!</h3>
                  <p className="text-slate-600 mb-8 px-4 font-medium leading-relaxed">
                    Get your skin status in 15 seconds
                  </p>
                  <div className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-200">
                    See Results
                  </div>
                </div>

                <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Analysis</div>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-blue-500"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background blobs for visual flair */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
