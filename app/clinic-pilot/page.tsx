import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Image from 'next/image'
import Footer from '@/components/ui/Footer'

export const metadata: Metadata = {
  title: 'AI Skin Checkup Pilot for Aesthetic Clinics — CureScan.pro',
  description:
    'A 1-month AI skin checkup pilot for aesthetic and dermatology clinics to qualify patients before consultation and convert WhatsApp chats into bookings.',
  openGraph: {
    title: 'AI Skin Checkup Pilot for Aesthetic Clinics',
    description:
      'Turn social media traffic into booked appointments — with context. A 1-month pilot for real-world performance testing.',
    type: 'website',
  },
}

const whatsappDemoHref =
  'https://wa.me/971501234567?text=Hi%20Anton%2C%20I%E2%80%99d%20like%20to%20request%20a%20short%20demo%20of%20the%20AI%20Skin%20Checkup%20Pilot%20for%20my%20clinic.'

const calendlyUrl = 'https://calendly.com/curescan-pro/15min' // Replace with your actual Calendly link

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
      {children}
    </h2>
  )
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  )
}

export default function ClinicPilotPage() {
  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <Image
              src="/curescanlogo.png"
              alt="CureScan.pro"
              width={36}
              height={36}
              className="w-9 h-9 rounded-lg object-cover"
              priority
            />
            <span className="font-extrabold tracking-tight text-slate-900">
              CureScan.pro
            </span>
          </a>
          <div className="flex items-center gap-3">
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex px-4 py-2 rounded-lg font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Book a call
            </a>
            <a
              href="/login"
              className="inline-flex px-4 py-2 rounded-lg font-bold text-white bg-primary-600 hover:bg-primary-700 transition shadow-sm"
            >
              Client login
            </a>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-bold text-slate-700">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                1-month pilot
              </div>
              <h1 className="mt-6 text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900">
                AI Skin Checkup Pilot for Aesthetic Clinics
              </h1>
              <p className="mt-6 text-xl text-slate-700 leading-relaxed">
                Turn social media traffic into booked appointments — with context
              </p>
              <p className="mt-6 text-base md:text-lg text-slate-600 leading-relaxed">
                In fast-moving, WhatsApp-first markets (like Dubai), patients expect speed, clarity,
                and personalization. This pilot helps clinics qualify patients before consultation
                and convert WhatsApp conversations into real bookings.
              </p>
              <div className="mt-6 text-sm font-bold text-slate-700">
                No apps. No friction. Mobile-first. WhatsApp-first.
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-black text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg"
                >
                  Book a discovery call
                </a>
                <a
                  href={whatsappDemoHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-lg"
                >
                  WhatsApp demo
                </a>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute -inset-4 bg-indigo-600/10 blur-3xl rounded-[3rem]" />
              <div className="relative w-[320px] h-[640px] bg-slate-900 rounded-[3rem] border-[10px] border-slate-800 shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-7 bg-slate-800 rounded-b-2xl z-20" />
                <div className="relative h-full w-full bg-white flex flex-col p-6 pt-12">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black grid place-items-center text-xs">
                        CS
                      </div>
                      <div className="text-xs font-bold text-slate-500 tracking-tight">
                        AI Skin Checkup
                      </div>
                    </div>
                    <div className="text-[10px] font-bold text-slate-400">Preview</div>
                  </div>

                  <div className="flex-grow flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 rounded-full bg-slate-50 border border-slate-200 flex flex-col items-center justify-center mb-6 shadow-sm">
                      <div className="text-[11px] font-bold text-slate-500">Skin Score</div>
                      <div className="text-5xl font-extrabold text-slate-900">82</div>
                      <div className="text-[11px] font-bold text-indigo-600">Good</div>
                    </div>

                    <div className="w-full grid grid-cols-3 gap-3 mb-6">
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-[10px] font-bold text-slate-500">Oil</div>
                        <div className="mt-1 text-sm font-extrabold text-slate-900">Medium</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-[10px] font-bold text-slate-500">Pores</div>
                        <div className="mt-1 text-sm font-extrabold text-slate-900">Visible</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="text-[10px] font-bold text-slate-500">Tone</div>
                        <div className="mt-1 text-sm font-extrabold text-slate-900">Uneven</div>
                      </div>
                    </div>

                    <div className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left mb-5">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Suggested Procedures (Clinic)
                      </div>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">
                              HydraFacial / Deep Cleansing
                            </div>
                            <div className="text-[11px] text-slate-500">
                              For pores and congestion
                            </div>
                          </div>
                          <div className="text-[11px] font-bold text-slate-400">From price list</div>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">
                              Chemical Peel (Brightening)
                            </div>
                            <div className="text-[11px] text-slate-500">
                              For tone and texture
                            </div>
                          </div>
                          <div className="text-[11px] font-bold text-slate-400">From price list</div>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-extrabold text-slate-900">
                              IPL / Photofacial
                            </div>
                            <div className="text-[11px] text-slate-500">
                              For redness and pigmentation
                            </div>
                          </div>
                          <div className="text-[11px] font-bold text-slate-400">From price list</div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full rounded-xl bg-emerald-600 text-white py-4 font-black shadow-lg shadow-emerald-600/20">
                      Book on WhatsApp
                    </div>
                    <div className="mt-3 text-[11px] text-slate-500">
                      Message is pre-filled with your analysis
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            <SectionTitle>What is this pilot?</SectionTitle>
            <p className="text-slate-600 leading-relaxed">
              A 1-month AI skin checkup pilot designed for aesthetic and dermatology clinics.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <div className="font-extrabold text-slate-900">
                  Patients upload a selfie and instantly receive
                </div>
                <div className="mt-2 text-slate-600">
                  A clear skin score and key concerns, plus a short, easy-to-understand analysis.
                </div>
              </Card>
              <Card>
                <div className="font-extrabold text-slate-900">Procedure recommendations</div>
                <div className="mt-2 text-slate-600">
                  Generated using your clinic’s own price list and services.
                </div>
              </Card>
              <Card className="sm:col-span-2">
                <div className="font-extrabold text-slate-900">
                  Your clinic receives a structured patient profile
                </div>
                <div className="mt-2 text-slate-600">
                  It makes WhatsApp conversations faster, warmer, and more effective.
                </div>
              </Card>
            </div>
            <p className="text-slate-600 leading-relaxed">
              This is a performance-based pilot — tailored to your clinic's volume.
            </p>
          </div>

          <aside className="lg:col-span-1">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
              <div className="text-sm font-bold text-slate-700">Why it converts</div>
              <ul className="mt-4 space-y-3 text-slate-700">
                <li className="flex gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  <span>Context before the first message</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  <span>Faster replies with structured patient info</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  <span>Higher intent: concerns + recommended procedures</span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                  <span>Trust before price discussion</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>

      <section id="features" className="py-14 md:py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <SectionTitle>Why this works</SectionTitle>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 grid place-items-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-emerald-600"
                  >
                    <path
                      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8A8.5 8.5 0 0 1 12.5 20a8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8A8.5 8.5 0 0 1 12.5 3h0A8.5 8.5 0 0 1 21 11.5Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mt-4 font-extrabold text-slate-900">WhatsApp-first</div>
                <div className="mt-2 text-sm text-slate-600">
                  Patients use chat as the main booking channel.
                </div>
              </Card>
              <Card>
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 grid place-items-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-indigo-600"
                  >
                    <path
                      d="M13 2L3 14h9l-1 8 10-12h-9l1-8Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mt-4 font-extrabold text-slate-900">Speed</div>
                <div className="mt-2 text-sm text-slate-600">
                  Decisions are made fast — slow replies lose clients.
                </div>
              </Card>
              <Card>
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 grid place-items-center">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-violet-600"
                  >
                    <path
                      d="M12 2 4 5v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V5l-8-3Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="mt-4 font-extrabold text-slate-900">Trust</div>
                <div className="mt-2 text-sm text-slate-600">
                  Premium services require trust before price discussion.
                </div>
              </Card>
            </div>

            <p className="mt-6 text-slate-600 leading-relaxed">
              This pilot creates context before the first message.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="space-y-6">
              <SectionTitle>How it works</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <div className="text-sm font-bold text-slate-500">Step 1</div>
                  <div className="mt-2 font-extrabold text-slate-900">Open a link</div>
                  <div className="mt-2 text-slate-600">
                    Instagram bio, ad, QR, or your website.
                  </div>
                </Card>
                <Card>
                  <div className="text-sm font-bold text-slate-500">Step 2</div>
                  <div className="mt-2 font-extrabold text-slate-900">Upload a selfie</div>
                  <div className="mt-2 text-slate-600">Mobile-first experience.</div>
                </Card>
                <Card>
                  <div className="text-sm font-bold text-slate-500">Step 3</div>
                  <div className="mt-2 font-extrabold text-slate-900">AI analyzes skin</div>
                  <div className="mt-2 text-slate-600">3–5 key skin parameters.</div>
                </Card>
                <Card>
                  <div className="text-sm font-bold text-slate-500">Step 4</div>
                  <div className="mt-2 font-extrabold text-slate-900">Recommendations</div>
                  <div className="mt-2 text-slate-600">Generated using your services.</div>
                </Card>
                <Card className="sm:col-span-2">
                  <div className="text-sm font-bold text-slate-500">Step 5</div>
                  <div className="mt-2 font-extrabold text-slate-900">
                    Book on WhatsApp (pre-filled)
                  </div>
                  <div className="mt-2 text-slate-600">
                    WhatsApp opens with a message referencing the analysis.
                  </div>
                </Card>
              </div>
            </div>

            <div className="space-y-6">
              <SectionTitle>What your clinic gets</SectionTitle>
              <div className="grid grid-cols-1 gap-4">
                <Card>
                  <ul className="space-y-3 text-slate-700">
                    <li className="flex gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      <span>Higher-quality, better-prepared patients</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      <span>Faster WhatsApp conversations</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      <span>Clear procedure intent before consultation</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      <span>Reduced admin workload</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-2 w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                      <span>Better conversion from social traffic</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <SectionTitle>1-Month Pilot Structure</SectionTitle>
            <a
              href={calendlyUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-black text-white bg-indigo-600 hover:bg-indigo-700 transition"
            >
              Book a call
            </a>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="text-sm font-bold text-slate-500">Setup (Days 1–5)</div>
              <ul className="mt-4 space-y-2 text-slate-700">
                <li>AI checkup configuration for your clinic</li>
                <li>Selection of 3–5 clinically relevant skin parameters</li>
                <li>Mapping results to your procedures and pricing</li>
                <li>White-label branding (logo, colors)</li>
              </ul>
            </Card>
            <Card>
              <div className="text-sm font-bold text-slate-500">Test (Days 6–25)</div>
              <ul className="mt-4 space-y-2 text-slate-700">
                <li>Use the checkup in ads, website, or WhatsApp</li>
                <li>Each patient generates a structured profile</li>
                <li>Clinic team uses results in chats and consultations</li>
              </ul>
            </Card>
            <Card>
              <div className="text-sm font-bold text-slate-500">Review (Days 26–30)</div>
              <ul className="mt-4 space-y-2 text-slate-700">
                <li>Review pilot results together</li>
                <li>Assess lead quality and booking intent</li>
                <li>Decide whether to continue — no long-term commitment</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-14 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            <div className="rounded-2xl border border-slate-200 bg-white p-8">
              <div className="text-sm font-bold text-slate-600">Pricing</div>
              <div className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">
                Custom Pricing
              </div>
              <div className="mt-4 text-slate-600">Tailored to your clinic's volume</div>
              <div className="mt-4 text-slate-600">Includes full setup and 1-month pilot</div>
              <div className="mt-6">
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-black text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg"
                >
                  Book a discovery call
                </a>
              </div>
              <div className="mt-6 text-sm font-bold text-slate-600">
                Limited number of clinics per month.
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-8">
              <div className="text-sm font-bold text-slate-600">Who this is for</div>
              <ul className="mt-4 space-y-2 text-slate-700">
                <li>Aesthetic clinics</li>
                <li>Dermatology clinics</li>
                <li>Medical spas focused on skin treatments</li>
                <li className="text-slate-600">
                  Best fit for clinics already running Instagram or Google Ads.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="py-14 md:py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-700 bg-slate-800 p-8 md:p-12">
            <div className="max-w-3xl">
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Book a discovery call
              </h2>
              <p className="mt-4 text-slate-300 leading-relaxed">
                If you’d like to see how this works for your clinic and discuss the pilot:
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <a
                  href={calendlyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-black text-slate-900 bg-white hover:bg-slate-100 transition shadow-lg"
                >
                  Schedule call via Calendly
                </a>
                <a
                  href={whatsappDemoHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-lg"
                >
                  WhatsApp demo
                </a>
              </div>

              <div className="mt-6 text-xs text-slate-400">
                Email: hello@curescan.pro
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
