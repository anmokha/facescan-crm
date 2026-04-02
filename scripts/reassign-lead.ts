
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { adminDb } = await import('../lib/firebaseAdmin');
  
  const LEAD_ID = '0mUSOfXpQGpWcwtE2Oc1';
  const TARGET_CLINIC_ID = 'LFt0SE1PbjYVs2quQb7kq1HxOno1';
  const OLD_CLINIC_ID = 'testklinika';
  const PHONE = '+7 (912) 345-67-89';

  console.log(`Reassigning Lead ${LEAD_ID} to clinic ${TARGET_CLINIC_ID}...`);

  // 1. Update Lead
  await adminDb.collection('leads').doc(LEAD_ID).update({
    clinicId: TARGET_CLINIC_ID
  });
  console.log('Lead updated.');

  // 2. Handle Customer
  console.log('Checking customers...');
  const customersRef = adminDb.collection('customers');
  
  // Find the customer record created under the "wrong" clinic
  const oldCustomerSnap = await customersRef
    .where('clinicId', '==', OLD_CLINIC_ID)
    .where('phone', '==', PHONE)
    .get();

  if (oldCustomerSnap.empty) {
      console.log('No customer record found for the old clinic. Skipping customer update.');
      return;
  }

  const oldCustomerDoc = oldCustomerSnap.docs[0];
  console.log(`Found old customer: ${oldCustomerDoc.id}`);

  // Check if target clinic already has this customer
  const targetCustomerSnap = await customersRef
    .where('clinicId', '==', TARGET_CLINIC_ID)
    .where('phone', '==', PHONE)
    .get();

  if (!targetCustomerSnap.empty) {
      console.log('Target clinic already has this customer. Merging...');
      const targetCustomerDoc = targetCustomerSnap.docs[0];
      
      // Update the lead to point to the EXISTING target customer
      await adminDb.collection('leads').doc(LEAD_ID).update({
          customerId: targetCustomerDoc.id
      });
      
      // Update target customer stats (simple increment)
      await targetCustomerDoc.ref.update({
          totalCheckups: (targetCustomerDoc.data().totalCheckups || 0) + 1,
          lastSeenAt: oldCustomerDoc.data().lastSeenAt,
          lastSkinScore: oldCustomerDoc.data().lastSkinScore
      });

      // Delete the old "wrong" customer record
      await oldCustomerDoc.ref.delete();
      console.log('Old customer deleted, lead re-linked to existing target customer.');

  } else {
      console.log('Target clinic does not have this customer. Moving customer record...');
      await oldCustomerDoc.ref.update({
          clinicId: TARGET_CLINIC_ID
      });
      console.log('Customer record moved to target clinic.');
  }
}

main();
