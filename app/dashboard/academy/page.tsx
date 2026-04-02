'use client'

import React, { useState } from 'react'
import { BookOpen, Rocket, PlayCircle, Zap, MessageCircle, BarChart2, Share2, ShieldCheck, ChevronRight, GraduationCap } from 'lucide-react'

// --- Content Data ---
const guides = [
  {
    id: 'quick-start',
    title: 'Quick Start',
    description: 'Launch the system in 5 minutes: from first link to first lead.',
    icon: Rocket,
    color: 'bg-blue-500',
    articles: [
      { 
        title: 'Create an Instagram Link', 
        time: '2 min',
        content: (
          <div className="space-y-6 text-slate-600">
            <p>The first step to a flow of leads is creating a unique link for your Instagram profile. This allows you to track exactly how many clients came from social media.</p>
            
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h4 className="font-bold text-blue-800 mb-2">Why do you need this?</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>You will see the exact number of clicks.</li>
                <li>AI will tag these leads with <b>Instagram</b>.</li>
                <li>You can compare the effectiveness of Stories vs Reels.</li>
              </ul>
            </div>

            <ol className="list-decimal list-inside space-y-4 font-medium text-slate-800">
              <li>
                Go to the <b>"Sources"</b> section in the left menu.
                <div className="my-3 h-32 bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                  [Screenshot: "Sources" button in menu]
                </div>
              </li>
              <li>
                Click the <b>"+ Create Source"</b> button.
              </li>
              <li>
                In the "Channel Type" field, select <b>Instagram</b>.
              </li>
              <li>
                Come up with a campaign name, for example: <code>summer_promo</code> or <code>bio_link</code>.
              </li>
              <li>
                Click "Create" and copy the generated link.
              </li>
            </ol>

            <div className="bg-slate-900 text-white p-4 rounded-xl mt-4">
              <p className="font-bold mb-1">Pro Tip:</p>
              <p className="text-sm opacity-80">Use different links for your Bio and for Stories. This way you'll know what works better!</p>
            </div>
          </div>
        )
      },
      { 
        title: 'Set up Telegram Notifications', 
        time: '1 min', 
        content: (
          <div className="space-y-6 text-slate-600">
            <p>Don't make clients wait. Get instant notifications about new leads directly in your messenger.</p>
            
            <ol className="list-decimal list-inside space-y-4 font-medium text-slate-800">
              <li>
                Go to the <b>"Settings"</b> section.
              </li>
              <li>
                Find the <b>Telegram Notifications</b> block.
                <div className="my-3 h-24 bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                  [Screenshot: Chat ID input field]
                </div>
              </li>
              <li>
                Message our bot <code>@CureScanBot</code> with the command <code>/start</code>.
              </li>
              <li>
                The bot will send you a <b>Chat ID</b> (a numeric code). Copy it.
              </li>
              <li>
                Paste the code into the settings field and click "Save".
              </li>
            </ol>
            
            <p className="text-sm bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-100">
              Now, as soon as a client leaves their phone number, you will receive a message with their photo, skin assessment, and a WhatsApp link.
            </p>
          </div>
        )
      },
      { 
        title: 'How to Test It Yourself (Demo)', 
        time: '3 min',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Before launching ads, go through the client journey yourself. This will help you understand what the patient feels.</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Open the created link in "Incognito" mode.</li>
              <li>Upload your photo (preferably without makeup).</li>
              <li>Wait for the analysis (10-15 seconds).</li>
              <li>Enter your phone number.</li>
              <li>Check the result: what <b>Skin Score</b> did the AI give you?</li>
            </ul>
            <p>After that, go to <b>"Leads"</b> and find your application. Try changing its status to "Booked".</p>
          </div>
        )
      }
    ]
  },
  {
    id: 'sales',
    title: 'Sales Playbook',
    description: 'How admins can sell more using AI data.',
    icon: Zap,
    color: 'bg-amber-500',
    articles: [
      { 
        title: 'Understanding "Tier System" (VIP vs Standard)', 
        time: '4 min',
        content: (
          <div className="space-y-6 text-slate-600">
            <p>CureScan automatically qualifies each lead, assigning them a status (Tier). This helps the administrator understand who to call first.</p>
            
            <div className="grid gap-4">
              <div className="border border-yellow-200 bg-yellow-50 p-4 rounded-xl">
                <h4 className="font-bold text-yellow-800 flex items-center gap-2">🏆 Tier S (VIP Gold)</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  <b>Who is this:</b> Clients with signs of high income (jewelry, grooming) + experienced in cosmetology (injection traces).
                  <br/><b>Strategy:</b> Offer package solutions immediately, courses of procedures, premium preparations. Do not give discounts "from the doorway".
                </p>
              </div>
              
              <div className="border border-blue-200 bg-blue-50 p-4 rounded-xl">
                <h4 className="font-bold text-blue-800 flex items-center gap-2">🥈 Tier A (Experienced)</h4>
                <p className="text-sm text-blue-700 mt-1">
                  <b>Who is this:</b> Clients who have already done procedures (lips, botox), but no obvious "luxury" markers.
                  <br/><b>Strategy:</b> Speak the language of results. They know what they want. Offer new products.
                </p>
              </div>
              
              <div className="border border-green-200 bg-green-50 p-4 rounded-xl">
                <h4 className="font-bold text-green-800 flex items-center gap-2">🌱 Tier B (Standard)</h4>
                <p className="text-sm text-green-700 mt-1">
                  <b>Who is this:</b> Beginners. Skin may be problematic, but no traces of interventions.
                  <br/><b>Strategy:</b> Education. Start with cleaning, peels, consultations. Soft entry.
                </p>
              </div>
            </div>
          </div>
        ) 
      },
      { 
        title: 'Call Script: "Hook, Pain, Solution"', 
        time: '5 min',
        content: (
          <div className="space-y-6 text-slate-600">
            <p>Don't say: "Hello, you left a request". It's boring. Use AI data to surprise the client.</p>
            
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
              <h4 className="font-bold text-slate-900 mb-4 border-b pb-2">Call Scenario</h4>
              
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-purple-500 uppercase">1. Hook</span>
                  <p className="italic text-slate-800">"Anna, good afternoon! This is Maria from Clinic N. The doctor just studied your AI skin analysis. You have excellent base tone (Score 82!), but there is one nuance the doctor noted..."</p>
                </div>
                
                <div>
                  <span className="text-xs font-bold text-red-500 uppercase">2. Pain</span>
                  <p className="italic text-slate-800">"The system showed slight dehydration in the forehead area. If not corrected now, small creases may appear by winter, which will be harder to remove."</p>
                </div>
                
                <div>
                  <span className="text-xs font-bold text-emerald-500 uppercase">3. Solution</span>
                  <p className="italic text-slate-800">"AI selected a 'Hydration' program for you. This is biorevitalization with preparation N. The effect will be visible immediately. We have a window for tomorrow at 2:00 PM. Should I book you for a consultation?"</p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      { 
        title: 'WhatsApp Templates: Which one to send?', 
        time: '3 min',
        content: (
          <div className="space-y-6 text-slate-600">
            <p>In the lead card, there is a <b>WhatsApp Action</b> button. 3 templates are hidden there. Use them wisely.</p>
            
            <ul className="space-y-4">
              <li className="bg-slate-50 p-4 rounded-xl">
                <b>👋 Care:</b> Send to those with a high Score.
                <br/><span className="text-sm italic opacity-70">"We received your report. The skin is in good condition, but to maintain this result..."</span>
              </li>
              <li className="bg-slate-50 p-4 rounded-xl">
                <b>🎯 Result:</b> Send to those with a specific problem (Acne, Pigmentation).
                <br/><span className="text-sm italic opacity-70">"The doctor looked at the photo: pigmentation can be removed in 3 IPL sessions..."</span>
              </li>
              <li className="bg-slate-50 p-4 rounded-xl">
                <b>🔥 Offer (Discount):</b> Send to "doubters" or those who don't pick up the phone.
                <br/><span className="text-sm italic opacity-70">"Only until Friday, 20% discount on the procedure recommended by AI..."</span>
              </li>
            </ul>
          </div>
        )
      }
    ]
  },
  {
    id: 'integrations',
    title: 'Integrations & CRM',
    description: 'Connect CureScan with your ecosystem.',
    icon:  Share2,
    color: 'bg-purple-600',
    articles: [
      { 
        title: 'Connect HubSpot (UAE)', 
        time: '3 min',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>For clinics in UAE, we support HubSpot integration.</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>In HubSpot, go to Settings &rarr; Integrations &rarr; Private Apps.</li>
              <li>Create a new app "CureScan".</li>
              <li>In the Scopes section, select <code>crm.objects.contacts.write</code>.</li>
              <li>Copy the <b>Access Token</b> (starts with pat-...).</li>
              <li>Paste it into CureScan settings.</li>
            </ol>
          </div>
        )
      },
      { 
        title: 'Magic Webhooks + Zapier', 
        time: '6 min',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>A universal way to connect anything (Google Sheets, Slack, Salesforce).</p>
            <ol className="list-decimal list-inside space-y-2">
              <li>Register at <a href="https://zapier.com" target="_blank" className="text-blue-500 underline">Zapier.com</a>.</li>
              <li>Create a new Zap. Trigger: <b>"Webhooks by Zapier"</b> &rarr; "Catch Hook".</li>
              <li>Copy the given URL (Webhook URL).</li>
              <li>Paste this URL into CureScan ("Integrations" &rarr; "Universal Webhook").</li>
              <li>Go through the diagnostic yourself to send test data.</li>
              <li>In Zapier, click "Test Trigger" — you will see JSON with client data.</li>
              <li>Now configure the action (Action): for example, "Create Row in Google Sheets".</li>
            </ol>
          </div>
        )
      }
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics & ROI',
    description: 'How to read charts and find profitable channels.',
    icon: BarChart2,
    color: 'bg-emerald-500',
    articles: [
      { 
        title: 'Flow Chart (Sankey): Where is the money?', 
        time: '4 min',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>The Sankey chart shows the movement of clients like a flow of water.</p>
            <ul className="list-disc list-inside space-y-2">
              <li><b>Left:</b> Your sources (where people came from).</li>
              <li><b>Center:</b> AI Diagnostic (how many people took the test).</li>
              <li><b>Right (Green):</b> Money (Payments).</li>
              <li><b>Right (Red):</b> Losses.</li>
            </ul>
            <p>If you see a thick red line from "VIP Leads" to "Loss" — it means administrators are processing rich clients poorly. Listen to the calls immediately!</p>
            <div className="my-4 h-48 bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-xs">
                  [Screenshot: Sankey Chart with explanations]
            </div>
          </div>
        )
      },
      { 
        title: 'Evaluating Influencer Traffic Quality', 
        time: '3 min',
        content: (
          <div className="space-y-4 text-slate-600">
            <p>Not all influencers are equally useful. One can bring 1000 people, but all "without money". Another — 50 people, but all VIPs.</p>
            <p>In the <b>Analytics</b> section, look at the Sources table. Pay attention not to "Number of Leads", but to <b>"Revenue"</b> and audience quality.</p>
          </div>
        )
      },
      { 
        title: 'LTV Potential: What does it mean?', 
        time: '2 min',
        content: (
          <div className="space-y-4 text-slate-600">
            <p><b>LTV Potential</b> is the sum of all procedures that AI recommended to a specific client.</p>
            <p>This is not money in the register, this is <b>money on the table</b>. This is what you CAN earn from this client if you conduct the consultation correctly.</p>
            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 font-bold text-center">
              Your goal is to turn Potential into Revenue.
            </div>
          </div>
        )
      }
    ]
  }
]

export default function AcademyPage() {
  const [selectedGuide, setSelectedGuide] = useState<any | null>(null)

  return (
    <div className="pb-20 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="mb-10 flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <GraduationCap size={32} />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">CureScan Academy</h1>
            <p className="text-slate-500 text-lg">Knowledge base, guides, and growth strategies for your clinic.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {guides.map((guide) => (
            <div 
                key={guide.id} 
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden group cursor-pointer"
                onClick={() => setSelectedGuide(guide)}
            >
                <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                        <div className={`w-12 h-12 ${guide.color} rounded-xl flex items-center justify-center text-white shadow-md`}>
                            <guide.icon size={24} />
                        </div>
                        <span className="text-slate-300 group-hover:text-slate-400 transition-colors">
                            <ChevronRight size={24} />
                        </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{guide.title}</h3>
                    <p className="text-slate-500 mb-6 leading-relaxed">{guide.description}</p>
                    
                    <div className="space-y-3">
                        {guide.articles.map((article: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-sm p-3 bg-slate-50 rounded-xl group-hover:bg-blue-50/50 transition-colors border border-transparent group-hover:border-blue-100">
                                <div className="flex items-center gap-3">
                                    <PlayCircle size={16} className="text-slate-400 group-hover:text-blue-500" />
                                    <span className="font-medium text-slate-700">{article.title}</span>
                                </div>
                                <span className="text-xs text-slate-400 font-mono">{article.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* FOOTER PROMO */}
      <div className="mt-12 bg-slate-900 rounded-3xl p-8 md:p-12 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10 max-w-xl">
              <h3 className="text-2xl font-bold text-white mb-3">Need personal help?</h3>
              <p className="text-slate-400 text-lg">Our Customer Success manager will help set up integrations and train your administrators.</p>
          </div>
          <div className="relative z-10">
              <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-slate-100 transition-colors shadow-xl">
                  Contact Support
              </button>
          </div>
          
          {/* Decor */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      {/* Article Modal */}
      {selectedGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedGuide(null)}>
              <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative flex flex-col md:flex-row" onClick={e => e.stopPropagation()}>
                  
                  {/* Sidebar Navigation */}
                  <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 p-6 overflow-y-auto">
                      <div className="flex items-center gap-3 mb-6">
                          <div className={`w-10 h-10 ${selectedGuide.color} rounded-lg flex items-center justify-center text-white shrink-0`}>
                              <selectedGuide.icon size={20} />
                          </div>
                          <h2 className="font-bold text-slate-900 leading-tight">{selectedGuide.title}</h2>
                      </div>
                      
                      <div className="space-y-2">
                          {selectedGuide.articles.map((article: any, i: number) => (
                              <button 
                                key={i}
                                className="w-full text-left p-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200 focus:outline-none focus:bg-white focus:border-blue-200 focus:text-blue-700"
                                onClick={(e) => {
                                    const contentContainer = document.getElementById('guide-content');
                                    if(contentContainer) {
                                        const el = document.getElementById(`article-${i}`);
                                        el?.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                              >
                                  {i + 1}. {article.title}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 bg-white p-8 overflow-y-auto" id="guide-content">
                      <button onClick={() => setSelectedGuide(null)} className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400 hover:text-slate-600 z-10">
                          <ChevronRight size={24} className="rotate-45" />
                      </button>

                      <div className="space-y-12 pb-12">
                          {selectedGuide.articles.map((article: any, i: number) => (
                              <div key={i} id={`article-${i}`} className="scroll-mt-8">
                                  <div className="flex items-center gap-3 mb-4">
                                      <span className="text-4xl font-black text-slate-100">{i + 1}</span>
                                      <h3 className="text-2xl font-bold text-slate-900">{article.title}</h3>
                                  </div>
                                  <div className="prose prose-slate max-w-none">
                                      {article.content}
                                  </div>
                                  {i < selectedGuide.articles.length - 1 && (
                                      <hr className="my-8 border-slate-100" />
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>

              </div>
          </div>
      )}

    </div>
  )
}