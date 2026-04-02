import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs, Timestamp, deleteDoc, doc, setDoc, getDoc, updateDoc, orderBy, limit, getCountFromServer } from 'firebase/firestore';
import { AnalysisResult } from './types';

export interface TrafficSource {
  id?: string;
  clinicId: string;
  name: string;
  type: string; // Allow flexible source types (e.g. 'snapchat_ads', 'google_maps')
  utm_source: string;
  utm_campaign: string;
  utm_content?: string;
  url: string;
  createdAt: any;
  archived?: boolean;
}

export interface Lead {
  id: string;
  clinicId: string;
  phone: string;
  phoneE164?: string;
  phoneDigits?: string;
  phoneCountry?: string;
  status: 'new' | 'contacted' | 'booked' | 'converted' | 'lost';
  createdAt: any;
  notes?: string;
  tracking?: { source: string, campaign: string };
  analysisResult?: AnalysisResult;
  comparison?: any;
  progress?: any;
  compareLeadId?: string;
  isFollowUp?: boolean;
  revenue?: number;
  diagnosticType?: string;
  soldService?: string;

  // WhatsApp Consent & Tracking (Dubai Pilot)
  whatsappOptIn?: boolean;
  whatsappClicked?: boolean;
  whatsappClickedProcedure?: string | null;
  whatsappClickedAt?: any; // Firestore Timestamp
  callbackRequested?: boolean;
  callbackRequestedAt?: any;
  callbackRequestedProcedure?: string | null;
  waitingForCall?: boolean;
  waitingForCallProcedure?: string | null;
  interestedProcedures?: string[];
  lastInterestedProcedure?: string | null;
  lastInterestedAt?: any; // Firestore Timestamp

  // Consent Metadata
  consentVersion?: string;
  consentText?: string;
  consentTimestamp?: any;
  consentIP?: string;
  consentUserAgent?: string;
}

export interface ClinicService {
  name: string;
  price: string;
  category?: string;
  description?: string;
}

export interface ClinicSettings {
  name: string;
  slug: string; // subdomain ID
  logoUrl?: string;
  customDomain?: string;
  isCustomDomainActive?: boolean;
  defaultCountry?: 'RU' | 'AE';
  defaultLocale?: 'ru-RU' | 'en-US' | 'ar-AE';
  supportedLocales?: Array<'ru-RU' | 'en-US' | 'ar-AE'>;
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
  customSystemPrompt?: string; // Overrides/Appends to default system prompt
  services?: ClinicService[]; // Custom price list

  // Revenue tracking
  estimatedAverageCheck?: number; // Estimated average revenue per conversion (in rubles)

  // Integrations
  integrations?: {
      webhook_url?: string;
      yclients?: {
          active: boolean;
          company_id: string;
          token: string; // Bearer token
      };
      hubspot?: {
          active: boolean;
          access_token: string; // Private App Token
      };
  };

  // Subscription
  plan?: 'trial' | 'starter' | 'pro' | 'enterprise';
  status?: 'active' | 'suspended';
  isPilot?: boolean;
  limits?: { 
    leads: number;
    checkups?: number;
  };

  // Precomputed counters (maintained by Cloud Functions)
  leadCount?: number;
  checkupCount?: number;
  newLeadCount?: number;
  convertedCount?: number;
  totalRevenue?: number;
  stats?: {
    new?: number;
    contacted?: number;
    qualified?: number;
    converted?: number;
    lost?: number;
  };

  // Social Proof Settings
  socialContent?: {
    googleMapsUrl?: string;
    lastSyncAt?: any;
  };
}

export interface DashboardStats {
  totalClicks: number;
  totalCheckups: number;
  totalVisits: number;
  totalLeads: number;
  conversions: number;
  revenue: number;
  funnelData: {
    labels: string[];
    subLabels: string[];
    colors: string[][];
    values: number[][];
  };
}

type TrafficStat = {
  clinicId: string
  bucket: string
  clicks?: number
  checkups?: number
  leads?: number
}

const normalizeBucket = (bucket: string) => {
  const b = (bucket || '').trim()
  if (!b || b === 'direct') return 'Direct / Organic'
  return b
}

const bucketFromTracking = (tracking: any) => {
  const campaign = (tracking?.campaign || '').trim()
  const source = (tracking?.source || '').trim()
  if (campaign) return campaign
  if (source && source !== 'direct') return source
  return 'Direct / Organic'
}

export interface Customer {
  id: string;
  clinicId: string;
  phone: string;
  phoneE164?: string;
  phoneDigits?: string;
  phoneCountry?: string;
  name?: string;
  email?: string;
  totalCheckups: number;
  lastSkinScore: number;
  lastSkinType?: string;
  firstSeenAt: any;
  lastSeenAt: any;
  source?: string;
  publicToken?: string;
  baselineLeadId?: string;
  baselineAt?: any;
  lastLeadId?: string;
  lastCheckupAt?: any;
  nextCheckupAt?: any;
  treatmentPlan?: Array<{
    name: string;
    price?: string;
    status?: string;
    sourceLeadId?: string;
    completedAt?: any;
    completedLeadId?: string;
    completedSessions?: number;
    totalSessions?: number;
    lastSessionDate?: string;
  }>;
}

// --- Customers ---

export async function getCustomers(clinicId: string): Promise<Customer[]> {
  const customersRef = collection(db, 'customers');
  const q = query(customersRef, where('clinicId', '==', clinicId));
  
  const snapshot = await getDocs(q);
  
  const customers = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Customer[];

  return customers.sort((a, b) => {
    const timeA = a.lastSeenAt?.seconds ?? 0;
    const timeB = b.lastSeenAt?.seconds ?? 0;
    return timeB - timeA;
  });
}

export async function getCustomerDetails(customerId: string): Promise<Customer | null> {
  const docRef = doc(db, 'customers', customerId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as Customer;
  }
  return null;
}

export async function updateCustomer(customerId: string, data: Partial<Customer>) {
  const docRef = doc(db, 'customers', customerId);
  await updateDoc(docRef, data);
}

export async function getCustomerHistory(customerId: string): Promise<Lead[]> {
  const leadsRef = collection(db, 'leads');
  const q = query(leadsRef, where('customerId', '==', customerId));
  
  const snapshot = await getDocs(q);
  
  const leads = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Lead[];

  return leads.sort((a, b) => {
    const timeA = a.createdAt?.seconds ?? 0;
    const timeB = b.createdAt?.seconds ?? 0;
    return timeB - timeA;
  });
}

// --- Clinics ---

export async function saveClinicSettings(clinicId: string, settings: ClinicSettings) {
  const docRef = doc(db, 'clinics', clinicId);
  await setDoc(docRef, settings, { merge: true });
}

export async function getClinicBySlug(slug: string): Promise<{id: string, settings: ClinicSettings} | null> {
  const clinicsRef = collection(db, 'clinics');
  const q = query(clinicsRef, where('slug', '==', slug));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, settings: doc.data() as ClinicSettings };
}

export async function getClinicByCustomDomain(domain: string): Promise<{id: string, settings: ClinicSettings} | null> {
  const clinicsRef = collection(db, 'clinics');
  const q = query(clinicsRef, where('customDomain', '==', domain));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, settings: doc.data() as ClinicSettings };
}

export async function checkSlugAvailability(slug: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`);
    if (!res.ok) return false;
    const data = await res.json();
    return data.available;
  } catch (e) {
    console.error("Error checking slug availability:", e);
    return false;
  }
}

export async function getClinicSettings(clinicId: string): Promise<ClinicSettings | null> {
  const docRef = doc(db, 'clinics', clinicId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return snap.data() as ClinicSettings;
  }
  return null;
}

// --- Leads ---

export async function getLeadsCount(clinicId: string): Promise<number> {
    const leadsRef = collection(db, 'leads');
    const q = query(leadsRef, where('clinicId', '==', clinicId));
    try {
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (e) {
      console.error("Error getting count:", e);
      return 0;
    }
}

export async function getLeads(clinicId: string): Promise<Lead[]> {
  const leadsRef = collection(db, 'leads');
  // Use client-side sorting to avoid needing a composite index on [clinicId, createdAt]
  const q = query(leadsRef, where('clinicId', '==', clinicId)); 
  const snapshot = await getDocs(q);
  
  const leads = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Lead[];

  return leads.sort((a, b) => {
    const timeA = a.createdAt?.seconds ?? 0;
    const timeB = b.createdAt?.seconds ?? 0;
    return timeB - timeA;
  });
}

export async function updateLead(leadId: string, data: Partial<Lead>) {
  const docRef = doc(db, 'leads', leadId);
  await updateDoc(docRef, data);
}

// --- Sources ---

// 1. Create a new source
export async function createSource(source: Omit<TrafficSource, 'id' | 'createdAt'>) {
  const colRef = collection(db, 'sources');
  const docRef = await addDoc(colRef, {
    ...source,
    createdAt: Timestamp.now(),
    archived: false
  });
  return { id: docRef.id, ...source };
}

// 2. Soft Delete source (Archive)
export async function deleteSource(sourceId: string) {
  await updateDoc(doc(db, 'sources', sourceId), {
    archived: true
  });
}

// 3. Get sources for a clinic
export async function getSources(clinicId: string, includeArchived = false) {
  const colRef = collection(db, 'sources');
  const q = query(colRef, where('clinicId', '==', clinicId));
  const snapshot = await getDocs(q);
  
  const allSources = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as TrafficSource[];

  if (includeArchived) return allSources;
  return allSources.filter(s => !s.archived);
}

// 3. Get Aggregated Stats for Dashboard (Robust Sankey Logic)
export async function getDashboardStats(clinicId: string): Promise<DashboardStats> {
  // A. Fetch Sources (for naming)
  const sources = await getSources(clinicId, true);
  const bucketLabelByKey = new Map<string, string>()
  sources.forEach((s) => {
    const key = normalizeBucket((s.utm_campaign || s.utm_source || '').trim())
    if (!bucketLabelByKey.has(key) && s.name) {
      bucketLabelByKey.set(key, s.name)
    }
  })
  
  // B. Fetch Leads (Raw Data)
  const leadsRef = collection(db, 'leads');
  const leadsQuery = query(leadsRef, where('clinicId', '==', clinicId));
  const leadsSnap = await getDocs(leadsQuery);
  const leads = leadsSnap.docs.map(d => d.data());
  
  // B.1 Fetch Traffic stats (Clicks/Checkups/Leads per bucket)
  const trafficRef = collection(db, 'traffic_stats')
  const trafficQuery = query(trafficRef, where('clinicId', '==', clinicId))
  const trafficSnap = await getDocs(trafficQuery)
  const trafficStats = trafficSnap.docs.map((d) => d.data() as TrafficStat)

  // C. Fetch Conversions
  const convRef = collection(db, 'conversions');
  const convQuery = query(convRef, where('clinicId', '==', clinicId));
  const convSnap = await getDocs(convQuery);
  const conversions = convSnap.docs.map(d => d.data());

  // --- 1. Aggregation Logic: Buckets (campaign preferred) ---
  const clicksByBucket: Record<string, number> = {}
  const checkupsByBucket: Record<string, number> = {}
  const leadsByBucketFromTraffic: Record<string, number> = {}

  trafficStats.forEach((s) => {
    const key = normalizeBucket(s.bucket)
    clicksByBucket[key] = (clicksByBucket[key] || 0) + Number(s.clicks || 0)
    checkupsByBucket[key] = (checkupsByBucket[key] || 0) + Number(s.checkups || 0)
    leadsByBucketFromTraffic[key] = (leadsByBucketFromTraffic[key] || 0) + Number(s.leads || 0)
  })

  const leadsByBucket: Record<string, any[]> = {}
  leads.forEach((lead: any) => {
    const key = bucketFromTracking(lead.tracking || {})
    if (!leadsByBucket[key]) leadsByBucket[key] = []
    leadsByBucket[key].push(lead)
  })

  // Choose top buckets by clicks (fallback: by leads)
  const allBuckets = new Set<string>([
    ...Object.keys(clicksByBucket),
    ...Object.keys(checkupsByBucket),
    ...Object.keys(leadsByBucketFromTraffic),
    ...Object.keys(leadsByBucket)
  ])

  if (allBuckets.size === 0) {
    allBuckets.add('Direct / Organic')
  }

  const bucketRows = Array.from(allBuckets).map((bucket) => ({
    bucket,
    clicks: clicksByBucket[bucket] || 0,
    checkups: checkupsByBucket[bucket] || 0,
    leads: (leadsByBucket[bucket]?.length || 0) || (leadsByBucketFromTraffic[bucket] || 0)
  }))

  bucketRows.sort((a, b) => (b.clicks + b.checkups + b.leads) - (a.clicks + a.checkups + a.leads))

  const topBuckets = bucketRows.slice(0, 5)
  const restBuckets = bucketRows.slice(5)
  const otherAgg = restBuckets.reduce(
    (acc, row) => {
      acc.clicks += row.clicks
      acc.checkups += row.checkups
      acc.leads += row.leads
      return acc
    },
    { clicks: 0, checkups: 0, leads: 0 }
  )

  const topSources = topBuckets.map((r) => ({
    key: r.bucket,
    label: bucketLabelByKey.get(r.bucket) || r.bucket,
    total: r.clicks + r.checkups + r.leads
  }))
  if (restBuckets.length > 0 && (otherAgg.clicks + otherAgg.checkups + otherAgg.leads) > 0) {
    topSources.push({
      key: 'Other Sources',
      label: 'Other Sources',
      total: otherAgg.clicks + otherAgg.checkups + otherAgg.leads
    })
  }

  const hasAdvancedSignals = leads.some((l: any) => l.whatsappClicked === true || l.status === 'booked' || l.status === 'converted') || conversions.length > 0

  // --- 2. Build Funnel Data ---
  // Always show early stages; append downstream only if clinic has signals.
  const funnelLabels = hasAdvancedSignals
    ? ['Clicks', 'Checkups', 'Leads', 'WhatsApp Clicked', 'Booked', 'Converted']
    : ['Clicks', 'Checkups', 'Leads']
  const subLabels = topSources.map((s) => s.label);

  // Color gradients for each source (light to dark)
  const baseGradients = [
    ['#FFB3BA', '#FF6B7A'], // Pink gradient (Instagram vibe)
    ['#B3E5FC', '#0288D1'], // Blue gradient (Google Ads)
    ['#C5E1A5', '#558B2F'], // Green gradient (Direct/Organic)
    ['#CE93D8', '#7B1FA2'], // Purple gradient (TikTok)
    ['#E0E0E0', '#757575']  // Grey gradient (Other)
  ];
  const colorGradients = subLabels.map((_, idx) => baseGradients[idx % baseGradients.length]);

  // Group leads by bucket (top + "Other Sources")
  const leadsBySource: Record<string, any[]> = {};
  topSources.forEach((s) => {
    leadsBySource[s.key] = [];
  });

  leads.forEach((lead: any) => {
    const key = bucketFromTracking(lead.tracking || {});

    // Find matching top source
    let matched = false;
    topSources.forEach((s) => {
      if (key === s.key) {
        leadsBySource[s.key].push(lead);
        matched = true;
      }
    });

    // If not in top 5, add to "Other Sources"
    if (!matched && leadsBySource['Other Sources']) {
      leadsBySource['Other Sources'].push(lead);
    }
  });

  // Calculate funnel values for each source
  const funnelValues: number[][] = [];

  funnelLabels.forEach((stage) => {
    const stageValues: number[] = [];

    topSources.forEach((s) => {
      const sourceLeads = leadsBySource[s.key] || [];
      let count = 0;

      const trafficRow =
        s.key === 'Other Sources'
          ? otherAgg
          : (bucketRows.find((r) => r.bucket === s.key) || { clicks: 0, checkups: 0, leads: 0 })

      if (stage === 'Clicks') {
        count = trafficRow.clicks || 0
      } else if (stage === 'Checkups') {
        count = trafficRow.checkups || 0
      } else if (stage === 'Leads') {
        // "Lead" in clinic sense: user left phone and unlocked the result.
        count = sourceLeads.length
      } else if (stage === 'WhatsApp Clicked') {
        count = sourceLeads.filter((l: any) => l.whatsappClicked === true).length;
      } else if (stage === 'Booked') {
        count = sourceLeads.filter((l: any) => l.status === 'booked' || l.status === 'converted').length;
      } else if (stage === 'Converted') {
        count = sourceLeads.filter((l: any) => l.status === 'converted').length;
      }

      stageValues.push(count);
    });

    funnelValues.push(stageValues);
  });

  // Calculate totals
  const totalLeads = leads.length;
  const totalRevenue = conversions.reduce((acc, c: any) => acc + (c.amount || 0), 0);

  const totalClicks = bucketRows.reduce((sum, r) => sum + (r.clicks || 0), 0)
  const totalCheckups = bucketRows.reduce((sum, r) => sum + (r.checkups || 0), 0)

  return {
    totalClicks,
    totalCheckups,
    totalVisits: totalClicks,
    totalLeads,
    conversions: conversions.length,
    revenue: totalRevenue,
    funnelData: {
      labels: funnelLabels,
      subLabels,
      colors: colorGradients,
      values: funnelValues
    }
  };
}
  
  export async function getRecentConversions(clinicId: string, limitCount = 5) {
    const convRef = collection(db, 'conversions');
    // Simple query without orderBy to avoid index requirement
    const q = query(convRef, where('clinicId', '==', clinicId));
    
    const snapshot = await getDocs(q);
    
    // Sort and limit on client side
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
        .slice(0, limitCount);
  }
