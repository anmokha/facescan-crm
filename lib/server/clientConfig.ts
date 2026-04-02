/**
 * Client Configuration Resolver
 *
 * Resolves tenant configuration from:
 * 1) legacy in-repo registry (static fallback),
 * 2) Firestore by slug,
 * 3) Firestore by clinic document id,
 * 4) Firestore by custom domain host.
 *
 * Includes short-lived caching to reduce repeated Firestore reads.
 */

import { adminDb } from '@/lib/firebaseAdmin';
import { CLIENTS, ClientConfig } from '@/clients/registry';
import { unstable_cache } from 'next/cache';
import { DiagnosticType } from '@/lib/diagnostic/types';
import { ClinicService } from '@/lib/diagnostic/dashboardService';

export interface ExtendedClientConfig {
  uid?: string; // Firebase Auth UID if associated
  id: string;
  name: string;
  slug: string;
  createdAt?: any;
  logoUrl?: string;
  customDomain?: string;
  isCustomDomainActive?: boolean;
  defaultCountry?: 'RU' | 'AE';
  defaultLocale?: string;
  supportedLocales?: string[];
  leadUnlockMethod?: 'otp' | 'phone';
  primaryContactChannel?: 'whatsapp' | 'sms' | 'phone' | 'instagram';
  whatsappNumber?: string;
  instagramHandle?: string;
  contactPhone?: string;
  telegramChatId?: string | number;
  theme?: {
    primaryColor: string;
    logoUrl?: string;
  };
  texts?: {
    title?: string;
    subtitle?: string;
    uploadSubtitle?: string;
  };
  modules?: DiagnosticType[];
  customSystemPrompt?: string;
  services?: ClinicService[];
  plan?: 'trial' | 'starter' | 'pro' | 'enterprise';
  status?: 'active' | 'suspended';
  isPilot?: boolean;
  limits?: { 
    leads: number;
    checkups?: number;
  };
  checkupCount?: number;
  subscription?: any;
  entitlements?: any;
  usage?: any;
}

const getClientConfigFromDb = async (slug: string, host?: string): Promise<ExtendedClientConfig | null> => {
  try {
    let clinicDoc = null;
    let uid = null;
    
    // A. Check Slug
    const slugQuery = await adminDb.collection('clinics').where('slug', '==', slug).limit(1).get();
    if (!slugQuery.empty) {
        clinicDoc = slugQuery.docs[0].data();
        uid = slugQuery.docs[0].id;
    }

    // B. Check direct clinic document ID (UID) fallback
    // Some parts of the app historically used `client=<clinicId>` where clinicId is the Firestore doc id.
    if (!clinicDoc) {
      const byId = await adminDb.collection('clinics').doc(slug).get();
      if (byId.exists) {
        clinicDoc = byId.data();
        uid = byId.id;
      }
    }

    // C. Check Host (Custom Domain)
    if (!clinicDoc && host) {
        const domainQuery = await adminDb.collection('clinics').where('customDomain', '==', host).limit(1).get();
         if (!domainQuery.empty) {
             clinicDoc = domainQuery.docs[0].data();
             uid = domainQuery.docs[0].id;
         }
    }

    if (clinicDoc) {
      return {
        // Use the REAL slug stored in DB (important for custom domains)
        id: clinicDoc.slug || slug,
        uid: uid,
        name: clinicDoc.name,
        slug: clinicDoc.slug || slug,
        defaultCountry: clinicDoc.defaultCountry,
        defaultLocale: clinicDoc.defaultLocale,
        supportedLocales: clinicDoc.supportedLocales,
        leadUnlockMethod: clinicDoc.leadUnlockMethod,
        primaryContactChannel: clinicDoc.primaryContactChannel,
        whatsappNumber: clinicDoc.whatsappNumber,
        instagramHandle: clinicDoc.instagramHandle,
        contactPhone: clinicDoc.contactPhone,
        theme: clinicDoc.theme,
        modules: clinicDoc.modules || ['skin'],
        texts: clinicDoc.texts,
        services: clinicDoc.services,
        customSystemPrompt: clinicDoc.customSystemPrompt,
        plan: clinicDoc.plan,
        status: clinicDoc.status,
        isPilot: clinicDoc.isPilot || false,
        checkupCount: clinicDoc.checkupCount || 0,
        limits: clinicDoc.limits,
        telegramChatId: clinicDoc.telegramChatId
      } as ExtendedClientConfig;
    }
  } catch (error) {
    console.error("Error fetching client config SSR:", error);
  }
  return null;
};

export const fetchClientConfig = async (slug: string, host?: string): Promise<ExtendedClientConfig | null> => {
  if (!slug || slug === 'default') {
    return null;
  }

  // 1. Legacy Static Registry
  if (CLIENTS[slug]) {
    // Cast to Extended for compatibility
    return CLIENTS[slug] as ExtendedClientConfig;
  }

  // 2. Dynamic Firestore with Cache
  // We use unstable_cache to cache the result for 60 seconds (or more) to avoid hitting Firestore on every request
  const getCachedConfig = unstable_cache(
    async (s: string, h?: string) => getClientConfigFromDb(s, h),
    ['client-config'],
    { 
      revalidate: 60, // Cache for 1 minute
      tags: [`client-config-${slug}`, `client-config-host-${host || 'none'}`] 
    }
  );

  return getCachedConfig(slug, host);
}
