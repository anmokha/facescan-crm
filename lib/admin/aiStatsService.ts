import { adminDb } from '@/lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

// Pricing per 1M tokens (in USD)
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // Gemini 2.5 Flash-Lite: $0.10 input, $0.40 output
  'gemini-2.5-flash-lite': { input: 0.10, output: 0.40 },
  'gemini-2.5-flash-lite-preview': { input: 0.10, output: 0.40 },
  // Gemini 2.5 Flash: $0.30 input, $2.50 output
  'gemini-2.5-flash': { input: 0.30, output: 2.50 },
  'gemini-2.5-flash-preview': { input: 0.30, output: 2.50 },
  // Gemini 3 Flash: $0.50 input, $3.00 output
  'gemini-3-flash': { input: 0.50, output: 3.00 },
  'gemini-3-flash-preview': { input: 0.50, output: 3.00 },
  // Legacy models (fallback)
  'gemini-2.0-flash': { input: 0.10, output: 0.40 },
  'gemini-1.5-flash': { input: 0.075, output: 0.30 },
  'default': { input: 0.30, output: 2.50 },
};

export type PeriodType = 'day' | 'week' | 'month';

export interface AIUsageLog {
  id: string;
  clinicId: string;
  timestamp: Date;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  action?: string;
}

export interface AIStatsSummary {
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface ActionBreakdown {
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface ClinicAIStats {
  clinicId: string;
  clinicName?: string;
  slug?: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  checkups: ActionBreakdown;
  service: ActionBreakdown;
}

export interface TimeSeriesData {
  label: string;
  requests: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

export interface AIStatsResponse {
  period: PeriodType;
  dateRange: {
    start: string;
    end: string;
  };
  summary: AIStatsSummary;
  clinics: ClinicAIStats[];
  timeSeries: TimeSeriesData[];
}

function getDateRange(period: PeriodType): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now);
  
  let start: Date;
  
  switch (period) {
    case 'day':
      // Current day from 00:00
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      break;
    case 'week':
      // Current calendar week (Monday to Sunday)
      const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start = new Date(now);
      start.setDate(now.getDate() - daysFromMonday);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      // Current calendar month
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  }
  
  return { start, end };
}

function calculateCost(model: string, inputTokens: number, outputTokens: number): number {
  const pricing = MODEL_PRICING[model] || MODEL_PRICING['default'];
  const inputCost = (inputTokens / 1_000_000) * pricing.input;
  const outputCost = (outputTokens / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

function createEmptyActionBreakdown(): ActionBreakdown {
  return {
    requests: 0,
    inputTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    estimatedCost: 0,
  };
}

function isCheckupAction(action?: string): boolean {
  if (!action) return true; // Default to checkup if no action specified
  // Checkups are: undefined, null, or any action that doesn't start with website_
  return !action.startsWith('website_');
}

export async function getAIStats(period: PeriodType): Promise<AIStatsResponse> {
  const { start, end } = getDateRange(period);
  
  // Query usage logs for the period
  const snapshot = await adminDb
    .collection('usage_logs')
    .where('timestamp', '>=', Timestamp.fromDate(start))
    .where('timestamp', '<=', Timestamp.fromDate(end))
    .orderBy('timestamp', 'asc')
    .get();
  
  const logs: AIUsageLog[] = snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      clinicId: data.clinicId || 'unknown',
      timestamp: data.timestamp?.toDate() || new Date(),
      model: data.model || 'unknown',
      inputTokens: data.inputTokens || 0,
      outputTokens: data.outputTokens || 0,
      totalTokens: data.totalTokens || 0,
      action: data.action,
    };
  });
  
  // Calculate summary
  const summary: AIStatsSummary = logs.reduce(
    (acc, log) => {
      acc.totalRequests += 1;
      acc.totalInputTokens += log.inputTokens;
      acc.totalOutputTokens += log.outputTokens;
      acc.totalTokens += log.totalTokens;
      acc.estimatedCost += calculateCost(log.model, log.inputTokens, log.outputTokens);
      return acc;
    },
    {
      totalRequests: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      estimatedCost: 0,
    }
  );
  
  // Aggregate by clinic with action breakdown
  const clinicMap = new Map<string, ClinicAIStats>();
  for (const log of logs) {
    const existing = clinicMap.get(log.clinicId);
    const logCost = calculateCost(log.model, log.inputTokens, log.outputTokens);
    const isCheckup = isCheckupAction(log.action);
    
    if (existing) {
      existing.requests += 1;
      existing.inputTokens += log.inputTokens;
      existing.outputTokens += log.outputTokens;
      existing.totalTokens += log.totalTokens;
      existing.estimatedCost += logCost;
      
      // Update breakdown
      const breakdown = isCheckup ? existing.checkups : existing.service;
      breakdown.requests += 1;
      breakdown.inputTokens += log.inputTokens;
      breakdown.outputTokens += log.outputTokens;
      breakdown.totalTokens += log.totalTokens;
      breakdown.estimatedCost += logCost;
    } else {
      const checkups = createEmptyActionBreakdown();
      const service = createEmptyActionBreakdown();
      
      const breakdown = isCheckup ? checkups : service;
      breakdown.requests = 1;
      breakdown.inputTokens = log.inputTokens;
      breakdown.outputTokens = log.outputTokens;
      breakdown.totalTokens = log.totalTokens;
      breakdown.estimatedCost = logCost;
      
      clinicMap.set(log.clinicId, {
        clinicId: log.clinicId,
        requests: 1,
        inputTokens: log.inputTokens,
        outputTokens: log.outputTokens,
        totalTokens: log.totalTokens,
        estimatedCost: logCost,
        checkups,
        service,
      });
    }
  }
  
  // Fetch clinic names and slugs
  const clinicIds = Array.from(clinicMap.keys()).filter(id => id !== 'unknown' && id !== 'default');
  const matchedIds = new Set<string>();
  
  if (clinicIds.length > 0) {
    // 1. Try to fetch by document ID directly
    for (const clinicId of clinicIds) {
      try {
        const docRef = await adminDb.collection('clinics').doc(clinicId).get();
        if (docRef.exists) {
          const data = docRef.data();
          const clinicStat = clinicMap.get(clinicId);
          if (clinicStat && data) {
            clinicStat.clinicName = data.name || data.clinicName || data.uid || clinicId;
            clinicStat.slug = data.slug;
            matchedIds.add(clinicId);
          }
        }
      } catch (e) {
        // Ignore errors for individual doc fetch
      }
    }
    
    // 2. Fetch remaining by uid field
    const unmatchedById = clinicIds.filter(id => !matchedIds.has(id));
    if (unmatchedById.length > 0) {
      for (let i = 0; i < unmatchedById.length; i += 10) {
        const batch = unmatchedById.slice(i, i + 10);
        const clinicsSnapshot = await adminDb
          .collection('clinics')
          .where('uid', 'in', batch)
          .get();
        
        clinicsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const uid = data?.uid;
          if (uid) {
            const clinicStat = clinicMap.get(uid);
            if (clinicStat) {
              clinicStat.clinicName = data.name || data.clinicName || uid;
              clinicStat.slug = data.slug;
              matchedIds.add(uid);
            }
          }
        });
      }
    }
    
    // 3. Fetch remaining by slug field
    const unmatchedByUid = clinicIds.filter(id => !matchedIds.has(id));
    if (unmatchedByUid.length > 0) {
      for (let i = 0; i < unmatchedByUid.length; i += 10) {
        const batch = unmatchedByUid.slice(i, i + 10);
        const slugSnapshot = await adminDb
          .collection('clinics')
          .where('slug', 'in', batch)
          .get();
        
        slugSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const slug = data?.slug;
          if (slug) {
            const clinicStat = clinicMap.get(slug);
            if (clinicStat) {
              clinicStat.clinicName = data.name || data.clinicName || slug;
              clinicStat.slug = slug;
              matchedIds.add(slug);
            }
          }
        });
      }
    }
  }
  
  const clinics = Array.from(clinicMap.values())
    .sort((a, b) => b.totalTokens - a.totalTokens);
  
  // Generate time series data
  const timeSeries = generateTimeSeries(logs, period, start, end);
  
  return {
    period,
    dateRange: {
      start: start.toISOString(),
      end: end.toISOString(),
    },
    summary,
    clinics,
    timeSeries,
  };
}

function generateTimeSeries(
  logs: AIUsageLog[],
  period: PeriodType,
  start: Date,
  end: Date
): TimeSeriesData[] {
  const dataMap = new Map<string, TimeSeriesData>();
  
  // Initialize all time slots with zeros
  if (period === 'day') {
    // Hourly buckets for day view
    for (let hour = 0; hour < 24; hour++) {
      const label = `${hour.toString().padStart(2, '0')}:00`;
      dataMap.set(label, { label, requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 });
    }
    
    // Fill with actual data
    for (const log of logs) {
      const hour = log.timestamp.getHours();
      const label = `${hour.toString().padStart(2, '0')}:00`;
      const entry = dataMap.get(label)!;
      entry.requests += 1;
      entry.inputTokens += log.inputTokens;
      entry.outputTokens += log.outputTokens;
      entry.cost += calculateCost(log.model, log.inputTokens, log.outputTokens);
    }
  } else if (period === 'week') {
    // Daily buckets for week view
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    for (let i = 0; i < 7; i++) {
      const label = days[i];
      dataMap.set(label, { label, requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 });
    }
    
    for (const log of logs) {
      const dayOfWeek = log.timestamp.getDay();
      const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to 0=Monday
      const label = days[dayIndex];
      const entry = dataMap.get(label)!;
      entry.requests += 1;
      entry.inputTokens += log.inputTokens;
      entry.outputTokens += log.outputTokens;
      entry.cost += calculateCost(log.model, log.inputTokens, log.outputTokens);
    }
  } else {
    // Daily buckets for month view
    const daysInMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      const label = `${day}`;
      dataMap.set(label, { label, requests: 0, inputTokens: 0, outputTokens: 0, cost: 0 });
    }
    
    for (const log of logs) {
      const day = log.timestamp.getDate();
      const label = `${day}`;
      const entry = dataMap.get(label)!;
      entry.requests += 1;
      entry.inputTokens += log.inputTokens;
      entry.outputTokens += log.outputTokens;
      entry.cost += calculateCost(log.model, log.inputTokens, log.outputTokens);
    }
  }
  
  return Array.from(dataMap.values());
}
