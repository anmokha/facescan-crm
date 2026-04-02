import Image from 'next/image'
import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                    <Image
                      src="/curescanlogo.png"
                      alt="CureScan.pro"
                      width={32}
                      height={32}
                      className="w-8 h-8 rounded-lg object-cover"
                    />
                    <span className="text-xl font-bold text-slate-900 tracking-tight">CureScan.pro</span>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                    AI-powered diagnostic platform for aesthetic clinics. Convert visitors into patients with visual proof.
                </p>
            </div>
            
            <div>
                <h4 className="font-bold text-slate-900 mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                    <li><a href="/clinic-pilot" className="hover:text-blue-600">Clinic Pilot</a></li>
                    <li><a href="#demo" className="hover:text-blue-600">Demo</a></li>
                    <li><a href="#features" className="hover:text-blue-600">Features</a></li>
                    <li><a href="/login" className="hover:text-blue-600">Client Login</a></li>
                </ul>
            </div>

             <div>
                <h4 className="font-bold text-slate-900 mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                    <li><a href="/privacy" className="hover:text-blue-600">Privacy Policy</a></li>
                    <li><a href="/terms" className="hover:text-blue-600">Terms of Service</a></li>
                </ul>
            </div>

             <div>
                <h4 className="font-bold text-slate-900 mb-4">Contact</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                    <li>Dubai, UAE</li>
                    <li>hello@curescan.pro</li>
                </ul>
            </div>
        </div>
        
        <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400">
            <p>&copy; {new Date().getFullYear()} CureScan.pro. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
                {/* Social icons if needed */}
            </div>
        </div>
      </div>
    </footer>
  )
}
