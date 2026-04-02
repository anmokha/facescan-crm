/**
 * Global App Layout
 *
 * Defines:
 * - default SEO metadata,
 * - global stylesheet mounting,
 * - top-level AuthProvider for client-side auth context.
 */

import type { Metadata } from 'next'
import '../styles/globals.css'
import { AuthProvider } from '@/lib/auth/AuthContext'

export const metadata: Metadata = {
  title: 'CureScan.pro — AI Skin & Hair Checkup in 15 seconds',
  description: 'Instant AI diagnosis of skin and hair condition from photos. Get a detailed report, active ingredient selection, and a personalized care plan.',
  keywords: 'skin checkup, online hair analysis, AI cosmetologist, skin diagnosis by photo, skincare selection, online trichology',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Your online checkup is ready at CureScan.pro',
    description: 'Find out your skin and hair condition in 15 seconds. Get your personal beauty plan right now.',
    url: 'https://curescan.pro',
    siteName: 'CureScan',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CureScan.pro — AI Skin Analysis',
    description: 'Instant diagnosis and personalized care recommendations.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-white text-slate-900">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
