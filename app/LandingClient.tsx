'use client'

import React from 'react'
import HeroSection from '@/components/sections/HeroSection'
import ProblemSection from '@/components/sections/ProblemSection'
import InteractiveDemoSection from '@/components/sections/InteractiveDemoSection'
import BenefitsSection from '@/components/sections/BenefitsSection'
import PilotLaunchSection from '@/components/sections/PilotLaunchSection'
import SecuritySection from '@/components/sections/SecuritySection'
import CTASection from '@/components/sections/CTASection'
import Footer from '@/components/ui/Footer'

// Helper for Color Generation (Client Side Version of the logic)
function generatePaletteStyles(primaryColor: string) {
  const hexToRgb = (hex: string) => {
    let c: any = hex.substring(1).split('');
    if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    c = '0x' + c.join('');
    return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
  }
  
  const rgbToHex = (r: number, g: number, b: number) => 
    "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

  const lighten = (hex: string, amount: number) => {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(
      Math.round(r + (255 - r) * amount),
      Math.round(g + (255 - g) * amount),
      Math.round(b + (255 - b) * amount)
    );
  }

  const darken = (hex: string, amount: number) => {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(
      Math.round(r * (1 - amount)),
      Math.round(g * (1 - amount)),
      Math.round(b * (1 - amount))
    );
  }

  const base = primaryColor || '#ec4899'; 

  return `
    :root {
      --color-primary-50: ${lighten(base, 0.95)};
      --color-primary-100: ${lighten(base, 0.9)};
      --color-primary-200: ${lighten(base, 0.75)};
      --color-primary-500: ${base};
      --color-primary-600: ${darken(base, 0.1)};
      --color-primary-700: ${darken(base, 0.2)};
    }
  `;
}

interface LandingClientProps {
    primaryColor: string;
}

export default function LandingClient({ primaryColor }: LandingClientProps) {
  return (
    <main className="min-h-screen bg-white">
      {/* Theme Injection */}
      <style dangerouslySetInnerHTML={{ __html: generatePaletteStyles(primaryColor) }} />
      
      <HeroSection />
      <ProblemSection />
      <InteractiveDemoSection />
      <BenefitsSection />
      <PilotLaunchSection />
      <SecuritySection />
      <CTASection />
      <Footer />
    </main>
  )
}
