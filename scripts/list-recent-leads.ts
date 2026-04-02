import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { adminDb } = await import('../lib/firebaseAdmin');
  console.log('Fetching recent leads...');
  const leadsSnap = await adminDb.collection('leads')
    .orderBy('createdAt', 'desc')
    .limit(10)
    .get();

  console.log('\n--- Recent Leads ---');
  const leads = leadsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
  
  leads.forEach((lead: any, index) => {
    const created = lead.createdAt?.toDate().toLocaleString() || 'N/A';
    console.log(`${index + 1}. ID: ${lead.id} | Phone: ${lead.phone} | Clinic: ${lead.clinicId} | Date: ${created}`);
  });
}

main();
