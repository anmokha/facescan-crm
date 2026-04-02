'use client'

import React from 'react'
import { Instagram, MessageCircle, MapPin, QrCode, Globe, Search, Facebook, Video } from 'lucide-react'

export default function PilotLaunchSection() {
  return (
    <section className="py-24 bg-slate-900 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <div className="inline-flex items-center space-x-2 bg-blue-900/50 text-blue-300 px-3 py-1.5 rounded-full mb-6 border border-blue-800">
              <span className="text-sm font-bold tracking-tight uppercase">Omnichannel Integration</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">
              Turn Cold Traffic into Warm Leads
            </h2>
            <p className="text-xl text-slate-400 mb-10 leading-relaxed">
              Don't just send traffic to a generic website. Integrate the AI Checkup link into any source to engage users instantly and get detailed medical profiles.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                        <Instagram className="w-5 h-5 text-pink-500" />
                        <span>Social Media</span>
                    </div>
                    <p className="text-sm text-slate-400">Instagram (Bio/Stories), TikTok, Telegram Channels.</p>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                         <MessageCircle className="w-5 h-5 text-green-500" />
                        <span>Messengers</span>
                    </div>
                    <p className="text-sm text-slate-400">WhatsApp Marketing & Automated Replies.</p>
                </div>

                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                         <Search className="w-5 h-5 text-blue-500" />
                        <span>Paid Ads</span>
                    </div>
                    <p className="text-sm text-slate-400">Meta Ads (FB/IG), Google Ads, TikTok Ads.</p>
                </div>

                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                         <MapPin className="w-5 h-5 text-red-500" />
                        <span>Local & Maps</span>
                    </div>
                    <p className="text-sm text-slate-400">Google Maps, Yandex Maps, Apple Maps.</p>
                </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                         <QrCode className="w-5 h-5 text-white" />
                        <span>Offline</span>
                    </div>
                    <p className="text-sm text-slate-400">QR Codes at Reception, Outdoor Ads, Flyers.</p>
                </div>
                 <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-white font-bold">
                         <Globe className="w-5 h-5 text-cyan-500" />
                        <span>Website</span>
                    </div>
                    <p className="text-sm text-slate-400">Widget integration on your main site.</p>
                </div>
            </div>

            <div className="mt-12">
               <a 
                href="https://calendly.com/curescan-pro/15min" 
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-black text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition-all"
               >
                Book Discovery Call
               </a>
            </div>
          </div>

          <div className="relative">
             <div className="absolute inset-0 bg-blue-600/20 rounded-3xl blur-3xl transform -rotate-6"></div>
             <div className="relative bg-slate-800 rounded-3xl p-8 border border-slate-700 shadow-2xl overflow-hidden">
                {/* Visual representation of Sources */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Card 1 */}
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 to-pink-500 flex items-center justify-center mb-3">
                            <Instagram className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-white text-sm">Instagram</span>
                        <span className="text-xs text-slate-400 mt-1">Bio & Stories Link</span>
                    </div>

                     {/* Card 2 */}
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center mb-3">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-white text-sm">WhatsApp</span>
                        <span className="text-xs text-slate-400 mt-1">Newsletter / Status</span>
                    </div>

                     {/* Card 3 */}
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center mb-3">
                            <Facebook className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-white text-sm">Meta Ads</span>
                        <span className="text-xs text-slate-400 mt-1">Direct to Checkup</span>
                    </div>

                     {/* Card 4 */}
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex flex-col items-center text-center">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-3">
                            <QrCode className="w-6 h-6 text-slate-900" />
                        </div>
                        <span className="font-bold text-white text-sm">Reception QR</span>
                        <span className="text-xs text-slate-400 mt-1">Convert Walk-ins</span>
                    </div>
                     {/* Card 5 */}
                    <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600 flex flex-col items-center text-center col-span-2">
                        <div className="flex items-center gap-3 mb-2">
                             <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                                <MapPin className="w-4 h-4 text-white" />
                            </div>
                             <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                                <Search className="w-4 h-4 text-white" />
                            </div>
                             <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                                <Video className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <span className="font-bold text-white text-sm">And Many More...</span>
                        <span className="text-xs text-slate-400 mt-1">Google Maps, TikTok, Website Widget</span>
                    </div>

                </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  )
}
