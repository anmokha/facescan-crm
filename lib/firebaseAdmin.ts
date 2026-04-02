/**
 * Firebase Admin Bootstrap
 *
 * Goals:
 * - initialize Admin SDK only when server credentials are present,
 * - provide safe exports for build-time imports,
 * - avoid hard failure during static type/build phases.
 *
 * Public-case note:
 * This file keeps runtime-safe mocks to make local builds possible in
 * environments where secret credentials are intentionally absent.
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin only if we have credentials
if (!admin.apps.length) {
  const privateKey = process.env.FIREBASE_SERVICE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_SERVICE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (privateKey && clientEmail && projectId) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      });
    } catch (error: any) {
      console.error('Firebase Admin initialization error', error.stack);
    }
  } else {
    // Only log in production/runtime to avoid noise during build if unrelated
    if (process.env.NODE_ENV !== 'test') {
        console.warn('⚠️ Firebase Admin credentials missing. Admin SDK not initialized.');
    }
  }
}

// Export adminDb safely. 
// If initialization failed, we export a Mock to allow "npm run build" to succeed 
// (Next.js imports API routes during build).
export const adminDb = admin.apps.length 
  ? admin.firestore() 
  : (() => {
      // Mock Firestore for Build/No-Env scenarios
      const createMock = () => ({
        collection: () => createMock(),
        doc: () => createMock(),
        where: () => createMock(),
        limit: () => createMock(),
        get: async () => ({ empty: true, docs: [], exists: false, data: () => ({}) }),
        add: async () => ({ id: 'mock-id' }),
        update: async () => {},
        set: async () => {},
      });
      return createMock() as unknown as admin.firestore.Firestore;
    })();

export const adminAuth = admin.apps.length 
  ? admin.auth()
  : (() => {
      // Mock Auth
      return {
          createCustomToken: async () => "mock-token"
      }
  })() as unknown as admin.auth.Auth;
