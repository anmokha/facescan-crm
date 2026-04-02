/**
 * Root Landing Route
 *
 * Behavior:
 * - detects current tenant via middleware-provided context,
 * - generates tenant-aware metadata,
 * - redirects tenant traffic to `/checkup`,
 * - renders generic marketing landing for default host.
 */

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import type { Metadata, ResolvingMetadata } from 'next'
import { fetchClientConfig } from '@/lib/server/clientConfig'
import LandingClient from './LandingClient'

export async function generateMetadata(
// ... existing metadata logic ...
): Promise<Metadata> {
  const headersList = headers();
  const clientId = headersList.get('x-client-id') || 'default';
  const host = headersList.get('host') || '';
  
  const client = await fetchClientConfig(clientId, host);

  if (client) {
    return {
      title: `${client.name} — AI-Диагностика Кожи`,
      description: client.texts?.subtitle || 'Пройдите бесплатную диагностику кожи онлайн и получите персональный план ухода.',
      openGraph: {
        title: `${client.name} — Ваш AI-Косметолог`,
        description: 'Мгновенный анализ состояния кожи по фото.',
      }
    }
  }

  return {
    title: 'CureScan.pro — AI Skin & Hair Checkup',
    description: 'Instant AI diagnosis of skin and hair condition from photos. Get a detailed report and personalized recommendations.',
  }
}

export default async function LandingPage() {
  const headersList = headers();
  const clientId = headersList.get('x-client-id') || 'default';
  const host = headersList.get('host') || '';
  
  const client = await fetchClientConfig(clientId, host);
  
  // If we are on a client subdomain or have a client ID, redirect to the Checkup App
  if (client && client.slug) {
      redirect(`/checkup?client=${client.slug}`);
  }

  const primaryColor = client?.theme?.primaryColor || '#ec4899';

  return <LandingClient primaryColor={primaryColor} />
}
