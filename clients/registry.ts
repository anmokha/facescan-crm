/**
 * CLIENT REGISTRY
 *
 * This file contains the type definitions for client configurations.
 * Specific client data has been migrated to Firestore.
 *
 * Use the 'clinics' collection in Firestore to manage client settings,
 * services, and themes dynamically without re-deploying.
 */

import { DiagnosticType } from '@/lib/diagnostic/types'
import { ClinicService } from '@/lib/diagnostic/dashboardService'

export interface ClientConfig {
  id: string;
  name: string;
  slug: string; // Add slug here
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
  services?: ClinicService[]; // Placeholder for custom price list
}

/**
 * Static registry fallback.
 * Migrated to Firestore. Keep empty unless you need a hardcoded emergency fallback.
 */
export const CLIENTS: Record<string, ClientConfig> = {};
