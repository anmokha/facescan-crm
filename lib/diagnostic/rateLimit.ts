
import { adminDb } from '@/lib/firebaseAdmin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export async function checkRateLimit(key: string, limit: number = 5): Promise<boolean> {
  const WINDOW_MS = 60 * 1000;
  
  const docRef = adminDb.collection('rate_limits').doc(key);
  
  try {
    const doc = await docRef.get();
    const now = Date.now();

    if (!doc.exists) {
      await docRef.set({
        count: 1,
        resetAt: Timestamp.fromMillis(now + WINDOW_MS)
      });
      return true;
    }

    const data = doc.data();
    const resetAt = data?.resetAt?.toMillis() || 0;

    if (now > resetAt) {
      // Window expired, reset
      await docRef.set({
        count: 1,
        resetAt: Timestamp.fromMillis(now + WINDOW_MS)
      });
      return true;
    }

    if (data && data.count >= limit) {
      return false; // Limit exceeded
    }

    // Increment
    await docRef.update({
      count: FieldValue.increment(1)
    });
    return true;

  } catch (e) {
    console.error("Rate limit error:", e);
    // Open fail (allow request if DB error) to avoid blocking valid users during outages
    return true; 
  }
}
