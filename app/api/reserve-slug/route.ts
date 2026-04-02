import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    // 1. Authenticate Request (Bearer Token)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const email = decodedToken.email; // Get email from Auth token

    const { slug, name } = await request.json();

    if (!slug || !name) {
      return NextResponse.json({ error: 'Slug and Name are required' }, { status: 400 });
    }

    // Validate slug format
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleanSlug !== slug || slug.length < 3) {
        return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 });
    }

    // 2. Transaction: Reserve Slug + Create/Update Clinic
    await adminDb.runTransaction(async (t) => {
        // A. Check User Clinic Profile (to see if they are changing slug)
        const clinicRef = adminDb.collection('clinics').doc(uid);
        const clinicDoc = await t.get(clinicRef);
        const oldSlug = clinicDoc.exists ? clinicDoc.data()?.slug : null;

        // B. Check New Slug Availability
        const newSlugRef = adminDb.collection('slugs').doc(cleanSlug);
        const newSlugDoc = await t.get(newSlugRef);

        if (newSlugDoc.exists) {
            // Check if it belongs to THIS user (idempotency or re-saving same slug)
            if (newSlugDoc.data()?.uid !== uid) {
                throw new Error('Slug already taken');
            }
        }

        // C. Operations
        
        // If slug changed, delete the OLD one
        if (oldSlug && oldSlug !== cleanSlug) {
            const oldSlugRef = adminDb.collection('slugs').doc(oldSlug);
            t.delete(oldSlugRef);
        }

        // Reserve NEW one
        if (!newSlugDoc.exists || oldSlug !== cleanSlug) {
            t.set(newSlugRef, {
                uid: uid,
                createdAt: FieldValue.serverTimestamp()
            });
        }

        if (!clinicDoc.exists) {
            // Create new profile
            t.set(clinicRef, {
                name: name,
                slug: cleanSlug,
                uid: uid,
                ownerEmail: email, // Save for admin visibility
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
                plan: 'trial',
                status: 'active',
                limits: { leads: 10 },
                subscriptionStatus: 'trial',
                isCustomDomainActive: false,
                theme: { primaryColor: '#0f172a' }
            });
        } else {
            // Update existing (Name/Slug only) - PRESERVE PLAN
            t.update(clinicRef, {
                name: name,
                slug: cleanSlug,
                ownerEmail: email,
                updatedAt: FieldValue.serverTimestamp()
            });
        }
    });

    return NextResponse.json({ success: true, slug: cleanSlug });

  } catch (error: any) {
    console.error('Reserve Slug Error:', error);
    if (error.message === 'Slug already taken') {
        return NextResponse.json({ error: 'Этот адрес уже занят' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
