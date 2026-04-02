/**
 * Backfill Lead Counters Script
 *
 * Purpose: Initialize leadCount and stats for all existing clinics
 * Run this ONCE after deploying Cloud Functions
 *
 * Usage:
 *   npx tsx scripts/backfill-lead-counters.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    clientEmail: process.env.FIREBASE_SERVICE_CLIENT_EMAIL!,
    privateKey: process.env.FIREBASE_SERVICE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore(app);

interface LeadStats {
  new: number;
  contacted: number;
  qualified: number;
  converted: number;
  lost: number;
}

interface ClinicCounters {
  leadCount: number;
  newLeadCount: number;
  convertedCount: number;
  totalRevenue: number;
  stats: LeadStats;
  lastLeadAt?: Date;
}

async function backfillClinicCounters() {
  console.log('🚀 Starting lead counter backfill...\n');

  try {
    // Get all clinics
    const clinicsSnap = await db.collection('clinics').get();
    console.log(`📊 Found ${clinicsSnap.size} clinics\n`);

    let successCount = 0;
    let errorCount = 0;

    // Process each clinic
    for (const clinicDoc of clinicsSnap.docs) {
      const clinicId = clinicDoc.id;
      const clinicData = clinicDoc.data();

      try {
        console.log(`Processing clinic: ${clinicData.name || clinicId}...`);

        // Count leads for this clinic
        const leadsSnap = await db
          .collection('leads')
          .where('clinicId', '==', clinicId)
          .get();

        const counters: ClinicCounters = {
          leadCount: leadsSnap.size,
          newLeadCount: 0,
          convertedCount: 0,
          totalRevenue: 0,
          stats: {
            new: 0,
            contacted: 0,
            qualified: 0,
            converted: 0,
            lost: 0,
          },
        };

        let mostRecentLeadDate: Date | null = null;

        // Count by status and calculate revenue
        leadsSnap.docs.forEach((leadDoc) => {
          const lead = leadDoc.data();
          const status = lead.status || 'new';
          const createdAt = lead.createdAt?.toDate();

          // Update stats
          if (counters.stats[status as keyof LeadStats] !== undefined) {
            counters.stats[status as keyof LeadStats]++;
          }

          // Count new leads
          if (status === 'new') {
            counters.newLeadCount++;
          }

          // Count converted leads and revenue
          if (status === 'converted') {
            counters.convertedCount++;
            if (lead.revenue) {
              counters.totalRevenue += lead.revenue;
            }
          }

          // Track most recent lead
          if (createdAt && (!mostRecentLeadDate || createdAt > mostRecentLeadDate)) {
            mostRecentLeadDate = createdAt;
          }
        });

        // Update clinic document
        const updateData: any = {
          leadCount: counters.leadCount,
          newLeadCount: counters.newLeadCount,
          convertedCount: counters.convertedCount,
          totalRevenue: counters.totalRevenue,
          stats: counters.stats,
          updatedAt: FieldValue.serverTimestamp(),
        };

        if (mostRecentLeadDate) {
          updateData.lastLeadAt = mostRecentLeadDate;
        }

        await clinicDoc.ref.update(updateData);

        console.log(`  ✅ Updated counters:`);
        console.log(`     - Total leads: ${counters.leadCount}`);
        console.log(`     - New leads: ${counters.newLeadCount}`);
        console.log(`     - Converted: ${counters.convertedCount}`);
        console.log(`     - Revenue: $${counters.totalRevenue.toFixed(2)}`);
        console.log(`     - Stats: ${JSON.stringify(counters.stats)}\n`);

        successCount++;
      } catch (error: any) {
        console.error(`  ❌ Failed to process clinic ${clinicId}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== Backfill Summary ===');
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log(`📊 Total: ${clinicsSnap.size}`);

    if (errorCount === 0) {
      console.log('\n🎉 Backfill completed successfully!');
    } else {
      console.log('\n⚠️  Backfill completed with errors. Check logs above.');
    }
  } catch (error) {
    console.error('❌ Backfill failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run backfill
backfillClinicCounters();
