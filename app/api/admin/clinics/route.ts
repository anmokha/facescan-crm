import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { FieldValue } from 'firebase-admin/firestore'
import { verifyAdminToken, hasPermission } from '@/lib/auth/verifyAdmin'
import { Permission } from '@/lib/auth/permissions'

export async function GET(request: NextRequest) {
  try {
    // 1. Verify admin token
    const adminUser = await verifyAdminToken(request);

    // 2. Check permission
    if (!hasPermission(adminUser, Permission.CLINICS_READ)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // 3. Fetch clinics
    const snap = await adminDb.collection('clinics').get()
    const clinics = snap.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name || 'Unnamed',
      slug: doc.data().slug || 'no-slug',
      leadCount: 0 // Placeholder, handled by client logic or separate query
    }))

    return NextResponse.json(clinics)

  } catch (error: any) {
    console.error('GET /api/admin/clinics error:', error);

    if (error.message.includes('Missing Authorization')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
    try {
        // 1. Verify admin token
        const adminUser = await verifyAdminToken(request);

        // 2. Check permission
        if (!hasPermission(adminUser, Permission.CLINICS_CREATE)) {
          return NextResponse.json(
            { error: 'Forbidden: Insufficient permissions' },
            { status: 403 }
          );
        }

        // 3. Parse and validate input
        const body = await request.json();
        const { name, slug, email = '', plan = 'trial', type = 'real', trafficWeight = 0, contactChannel = 'whatsapp', instagramHandle = '', whatsappNumber = '' } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and Slug are required' }, { status: 400 });
        }

        // Validate slug format
        if (!/^[a-z0-9-]+$/.test(slug)) {
          return NextResponse.json(
            { error: 'Invalid slug format. Use only lowercase letters, numbers, and hyphens.' },
            { status: 400 }
          );
        }

        // 4. Check uniqueness
        const existing = await adminDb.collection('clinics').where('slug', '==', slug).get();
        if (!existing.empty) {
            return NextResponse.json({ error: 'Slug already taken' }, { status: 409 });
        }

        // 5. Create clinic
        const newClinic: any = {
            name,
            slug,
            email, // Owner email
            plan,
            type,
            isActive: true,
            trafficWeight,
            contactChannel,
            instagramHandle,
            whatsappNumber,
            createdAt: FieldValue.serverTimestamp(),
            createdBy: adminUser.uid,
            theme: {
                primaryColor: '#ec4899', // Default Pink
            },
            defaultLocale: 'en-US',
            limits: {
                leads: plan === 'trial' ? 50 : 1000,
                checkups: 0, // Default to 0, admin will add manually
            },
            isPilot: false, // Default not pilot
            status: 'active',
            leadCount: 0, // Initialize counter
            checkupCount: 0,
            newLeadCount: 0,
        };

        const docRef = await adminDb.collection('clinics').add(newClinic);

        // 6. Audit log
        await adminDb.collection('admin_audit').add({
          action: 'CREATE_CLINIC',
          actorUid: adminUser.uid,
          actorEmail: adminUser.email,
          resourceType: 'clinic',
          resourceId: docRef.id,
          changes: {
            after: { slug, name, plan, type }
          },
          timestamp: FieldValue.serverTimestamp(),
          success: true,
          metadata: {
            slug: slug,
            plan: plan,
            type: type
          }
        });

        return NextResponse.json({ success: true, id: docRef.id, slug: slug });

    } catch (error: any) {
        console.error("Create clinic failed:", error);

        if (error.message.includes('Missing Authorization')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (error.message.includes('Forbidden')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ error: 'Failed to create clinic' }, { status: 500 });
    }
}
