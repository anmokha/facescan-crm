
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { adminDb } = await import('../lib/firebaseAdmin');
  
  const TARGET_CLINIC_ID = 'LFt0SE1PbjYVs2quQb7kq1HxOno1';
  const PHONE = '+7 (912) 345-67-89';

  console.log(`Checking customer for clinic ${TARGET_CLINIC_ID}...`);

  const customersRef = adminDb.collection('customers');
  const q = customersRef
    .where('clinicId', '==', TARGET_CLINIC_ID)
    .where('phone', '==', PHONE);

  const snap = await q.get();

  if (snap.empty) {
      console.log('❌ Customer NOT FOUND in query.');
      
      // Try fetching by ID directly if we recall it from previous step
      // ID was xyx6C6BgFqEmCuFXujRE
      const doc = await customersRef.doc('xyx6C6BgFqEmCuFXujRE').get();
      if (doc.exists) {
          console.log('⚠️ Document exists by ID but query failed.');
          console.log('Data:', doc.data());
      } else {
          console.log('❌ Document does not exist by ID either.');
      }
  } else {
      console.log('✅ Customer FOUND in query.');
      snap.docs.forEach(d => console.log(d.id, d.data()));
  }
}

main();
