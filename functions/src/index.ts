/**
 * Firebase Cloud Functions (2nd Gen) for CureScan
 *
 * Purpose: Maintain real-time lead counters and statistics for clinics
 * Solves: N+1 query problem in admin panel
 */

import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import {
  onDocumentCreated,
  onDocumentDeleted,
  onDocumentUpdated,
} from 'firebase-functions/v2/firestore';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { Resend } from 'resend';

admin.initializeApp();
const db = admin.firestore();

// Set region to align with Firestore multi-region (adjust if your DB is in eur3)
// For Firestore location 'nam5' use 'us-central1'; for 'eur3' use 'europe-west1'
setGlobalOptions({ region: 'europe-west1' });

const normalizeText = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return value.toLowerCase().replace(/\s+/g, ' ').trim();
};

const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === 'function') return value.toDate();
  return null;
};

const addDays = (date: Date, days: number) => {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
};

const RETENTION_INTERVAL_DAYS = 7;

const markCustomerTreatmentCompleted = async (
  customerId: string,
  soldService: string,
  leadId?: string,
  completedAt?: any
) => {
  if (!customerId || !soldService) return;

  const customerRef = db.collection('customers').doc(customerId);
  const customerSnap = await customerRef.get();
  if (!customerSnap.exists) return;

  const data = customerSnap.data() || {};
  const plan = Array.isArray(data.treatmentPlan) ? data.treatmentPlan : [];
  if (plan.length === 0) return;

  const sold = normalizeText(soldService);
  const matchIndex = plan.findIndex((item: any) => {
    const name = normalizeText(item?.name);
    if (!name) return false;
    return name === sold || name.includes(sold) || sold.includes(name);
  });

  if (matchIndex === -1) return;

  const completionDate = toDate(completedAt) || new Date();
  const nextCheckupAt = admin.firestore.Timestamp.fromDate(
    addDays(completionDate, RETENTION_INTERVAL_DAYS)
  );

  const updatedPlan = plan.map((item: any, idx: number) => {
    if (idx !== matchIndex) return item;
    return {
      ...item,
      status: 'Completed',
      completedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedLeadId: leadId || item.completedLeadId
    };
  });

  await customerRef.update({
    treatmentPlan: updatedPlan,
    nextCheckupAt
  });
};

const scheduleFollowupEmail = async (leadId: string, leadData: any) => {
  if (!leadId || !leadData?.customerId) return;

  const notificationRef = db.collection('notifications').doc(`followup_${leadId}`);
  const existing = await notificationRef.get();
  if (existing.exists) return;

  const customerRef = db.collection('customers').doc(leadData.customerId);
  const customerSnap = await customerRef.get();
  const customerData = customerSnap.exists ? customerSnap.data() : {};

  const convertedAt = leadData.convertedAt?.toDate ? leadData.convertedAt.toDate() : new Date();
  const sendAt = new Date(convertedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

  await notificationRef.set({
    type: 'procedure_followup',
    status: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    sendAt: admin.firestore.Timestamp.fromDate(sendAt),
    clinicId: leadData.clinicId || null,
    leadId,
    customerId: leadData.customerId,
    soldService: leadData.soldService || null,
    email: leadData.email || customerData?.email || null,
    publicToken: customerData?.publicToken || null,
    attempts: 0
  });
};

const getBaseUrl = () => {
  const raw = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://curescan.pro';
  return raw.endsWith('/') ? raw.slice(0, -1) : raw;
};

const buildJourneyUrl = (token?: string | null) => {
  if (!token) return getBaseUrl();
  return `${getBaseUrl()}/journey/${token}`;
};

/**
 * Increment lead counters when a new lead is created
 *
 * Updates:
 * - leadCount: Total number of leads
 * - newLeadCount: Number of leads with status 'new'
 * - lastLeadAt: Timestamp of most recent lead
 * - stats: Per-status breakdown
 */
export const onLeadCreate = onDocumentCreated('leads/{leadId}', async (event) => {
    const snap = event.data;
    if (!snap) return;
    const lead = snap.data();
    const clinicId = (lead as any).clinicId;

    if (!clinicId) {
      logger.warn(`Lead ${event.params?.leadId} has no clinicId`);
      return;
    }

    const clinicRef = db.collection('clinics').doc(clinicId);

    try {
      await db.runTransaction(async (transaction) => {
        const clinicDoc = await transaction.get(clinicRef);

        if (!clinicDoc.exists) {
          logger.warn(`Clinic ${clinicId} not found`);
          return;
        }

        const data = clinicDoc.data()!;
        const currentCount = data.leadCount || 0;
        const currentNew = data.newLeadCount || 0;
        const stats = data.stats || {
          new: 0,
          contacted: 0,
          qualified: 0,
          converted: 0,
          lost: 0
        };

        // Increment total count
        const updates: any = {
          leadCount: currentCount + 1,
          lastLeadAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // Increment status-specific counters
        const leadStatus = lead.status || 'new';
        if (leadStatus === 'new') {
          updates.newLeadCount = currentNew + 1;
        }

        // Update per-status stats
        if (stats[leadStatus] !== undefined) {
          stats[leadStatus] = (stats[leadStatus] || 0) + 1;
          updates.stats = stats;
        }

        transaction.update(clinicRef, updates);
      });

      logger.info(`✅ Lead counter incremented for clinic ${clinicId}`);
    } catch (error) {
      logger.error(`❌ Failed to increment counter for clinic ${clinicId}: ${String(error)}`);
    }
  });

/**
 * Decrement lead counters when a lead is deleted
 */
export const onLeadDelete = onDocumentDeleted('leads/{leadId}', async (event) => {
    const snap = event.data;
    if (!snap) return;
    const lead = snap.data();
    const clinicId = (lead as any).clinicId;

    if (!clinicId) {
      logger.warn(`Deleted lead ${event.params?.leadId} had no clinicId`);
      return;
    }

    const clinicRef = db.collection('clinics').doc(clinicId);

    try {
      await db.runTransaction(async (transaction) => {
        const clinicDoc = await transaction.get(clinicRef);

        if (!clinicDoc.exists) {
          logger.warn(`Clinic ${clinicId} not found`);
          return;
        }

        const data = clinicDoc.data()!;
        const currentCount = data.leadCount || 0;
        const currentNew = data.newLeadCount || 0;
        const stats = data.stats || {
          new: 0,
          contacted: 0,
          qualified: 0,
          converted: 0,
          lost: 0
        };

        // Decrement total count (never go below 0)
        const updates: any = {
          leadCount: Math.max(0, currentCount - 1)
        };

        // Decrement status-specific counters
        const leadStatus = lead.status || 'new';
        if (leadStatus === 'new') {
          updates.newLeadCount = Math.max(0, currentNew - 1);
        }

        // Update per-status stats
        if (stats[leadStatus] !== undefined) {
          stats[leadStatus] = Math.max(0, (stats[leadStatus] || 0) - 1);
          updates.stats = stats;
        }

        transaction.update(clinicRef, updates);
      });

      logger.info(`✅ Lead counter decremented for clinic ${clinicId}`);
    } catch (error) {
      logger.error(`❌ Failed to decrement counter for clinic ${clinicId}: ${String(error)}`);
    }
  });

/**
 * Update lead counters when lead status changes
 *
 * Example: Lead goes from 'new' -> 'contacted'
 * - Decrement newLeadCount
 * - Update stats.new (decrement)
 * - Update stats.contacted (increment)
 */
export const onLeadUpdate = onDocumentUpdated('leads/{leadId}', async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    if (!before || !after) return;

    // Only react to status changes
    if (before.status === after.status) {
      return;
    }

    const clinicId = after.clinicId;

    if (!clinicId) {
      logger.warn(`Lead ${event.params?.leadId} has no clinicId`);
      return;
    }

    const clinicRef = db.collection('clinics').doc(clinicId);

    try {
      await db.runTransaction(async (transaction) => {
        const clinicDoc = await transaction.get(clinicRef);

        if (!clinicDoc.exists) {
          logger.warn(`Clinic ${clinicId} not found`);
          return;
        }

        const data = clinicDoc.data()!;
        const currentNew = data.newLeadCount || 0;
        const stats = data.stats || {
          new: 0,
          contacted: 0,
          qualified: 0,
          converted: 0,
          lost: 0
        };

        const oldStatus = before.status || 'new';
        const newStatus = after.status || 'new';

        const updates: any = {};

        // Update newLeadCount
        if (oldStatus === 'new' && newStatus !== 'new') {
          updates.newLeadCount = Math.max(0, currentNew - 1);
        } else if (oldStatus !== 'new' && newStatus === 'new') {
          updates.newLeadCount = currentNew + 1;
        }

        // Update per-status stats
        if (stats[oldStatus] !== undefined) {
          stats[oldStatus] = Math.max(0, (stats[oldStatus] || 0) - 1);
        }
        if (stats[newStatus] !== undefined) {
          stats[newStatus] = (stats[newStatus] || 0) + 1;
        }
        updates.stats = stats;

        // If converted, update revenue tracking
        if (newStatus === 'converted' && !before.convertedAt) {
          const convertedCount = data.convertedCount || 0;
          const totalRevenue = data.totalRevenue || 0;
          const leadRevenue = after.revenue || 0;

          updates.convertedCount = convertedCount + 1;
          updates.totalRevenue = totalRevenue + leadRevenue;
        }

        transaction.update(clinicRef, updates);
      });

      const oldStatus = before.status || 'new';
      const newStatus = after.status || 'new';
      if (newStatus === 'converted' && oldStatus !== 'converted') {
        try {
          await markCustomerTreatmentCompleted(
            after.customerId,
            after.soldService,
            event.params?.leadId,
            after.convertedAt
          );
        } catch (planError) {
          logger.warn(`⚠️ Failed to update treatment plan for lead ${event.params?.leadId}: ${String(planError)}`);
        }

        try {
          await scheduleFollowupEmail(event.params?.leadId || '', after);
        } catch (scheduleError) {
          logger.warn(`⚠️ Failed to schedule followup for lead ${event.params?.leadId}: ${String(scheduleError)}`);
        }
      }

      logger.info(`✅ Lead stats updated for clinic ${clinicId} (${before.status} -> ${after.status})`);
    } catch (error) {
      logger.error(`❌ Failed to update stats for clinic ${clinicId}: ${String(error)}`);
    }
  });

/**
 * Update revenue when a lead is marked as converted with revenue data
 *
 * This function handles retroactive revenue updates
 */
export const onLeadRevenueUpdate = onDocumentUpdated('leads/{leadId}', async (event) => {
    const before = event.data?.before?.data();
    const after = event.data?.after?.data();

    if (!before || !after) return;

    // Only react to revenue changes on converted leads
    if (after.status !== 'converted' || before.revenue === after.revenue) {
      return;
    }

    const clinicId = after.clinicId;

    if (!clinicId) {
      return;
    }

    const clinicRef = db.collection('clinics').doc(clinicId);

    try {
      await db.runTransaction(async (transaction) => {
        const clinicDoc = await transaction.get(clinicRef);

        if (!clinicDoc.exists) {
          return;
        }

        const data = clinicDoc.data()!;
        const currentRevenue = data.totalRevenue || 0;
        const oldRevenue = before.revenue || 0;
        const newRevenue = after.revenue || 0;

        const revenueDelta = newRevenue - oldRevenue;

        transaction.update(clinicRef, {
          totalRevenue: currentRevenue + revenueDelta
        });
      });

      logger.info(`✅ Revenue updated for clinic ${clinicId} (delta: ${(after.revenue || 0) - (before.revenue || 0)})`);
    } catch (error) {
      logger.error(`❌ Failed to update revenue for clinic ${clinicId}: ${String(error)}`);
    }
  });

/**
 * Scheduled job: send follow-up emails for completed procedures
 */
export const sendProcedureFollowups = onSchedule('every 24 hours', async () => {
    const now = admin.firestore.Timestamp.now();
    const snap = await db.collection('notifications')
      .where('type', '==', 'procedure_followup')
      .where('status', '==', 'pending')
      .where('sendAt', '<=', now)
      .limit(25)
      .get();

    if (snap.empty) {
      return;
    }

    if (!process.env.RESEND_API_KEY) {
      logger.warn('RESEND_API_KEY is not configured. Skipping follow-up emails.');
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    for (const doc of snap.docs) {
      const data = doc.data();
      const customerId = data.customerId;
      let email = data.email;
      let publicToken = data.publicToken;

      if ((!email || !publicToken) && customerId) {
        const customerSnap = await db.collection('customers').doc(customerId).get();
        if (customerSnap.exists) {
          const customer = customerSnap.data() || {};
          email = email || customer.email;
          publicToken = publicToken || customer.publicToken;
        }
      }

      if (!email) {
        await doc.ref.update({
          status: 'skipped',
          errorMessage: 'missing_email',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        continue;
      }

      const journeyUrl = buildJourneyUrl(publicToken);
      const serviceName = data.soldService ? `после процедуры ${data.soldService}` : 'после вашей процедуры';

      const html = `
        <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.6;">
          <h2 style="margin-bottom: 8px;">Пора посмотреть ваш прогресс</h2>
          <p style="margin: 0 0 16px;">Прошла неделя ${serviceName}. Сделайте быстрый чекап — так вы увидите результат и сможете закрепить эффект.</p>
          <a href="${journeyUrl}" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 18px; border-radius: 10px; font-weight: 700; text-decoration: none;">Открыть мой прогресс</a>
          <p style="margin-top: 16px; font-size: 12px; color: #64748b;">Если ссылка не открывается, скопируйте её в браузер: ${journeyUrl}</p>
        </div>
      `;

      try {
        await resend.emails.send({
          from: 'CureScan <expert@mail.curescan.pro>',
          to: [email],
          subject: 'Пора проверить результат после процедуры',
          html
        });

        await doc.ref.update({
          status: 'sent',
          sentAt: admin.firestore.FieldValue.serverTimestamp(),
          email,
          publicToken,
          attempts: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } catch (error: any) {
        logger.error(`❌ Follow-up email failed for ${doc.id}: ${String(error)}`);
        await doc.ref.update({
          status: 'error',
          errorMessage: String(error),
          attempts: admin.firestore.FieldValue.increment(1),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }
  });
