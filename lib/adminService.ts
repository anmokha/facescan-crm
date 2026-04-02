import { adminDb, adminAuth } from '@/lib/firebaseAdmin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

async function verifyAdmin() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('__session')?.value;

  if (!sessionCookie) {
    redirect('/login?redirect=/admin');
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    if (!decodedClaims.admin) {
       // If valid user but not admin -> 403 or redirect
       console.error('User is not an admin:', decodedClaims.uid);
       redirect('/login?error=not_admin');
    }
    return decodedClaims;
  } catch (error: any) {
    // Check if it's a redirect error (NEXT_REDIRECT) -> rethrow
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
        throw error;
    }
    
    console.error('Admin verification failed:', error);
    redirect('/login?redirect=/admin');
  }
}

export interface ClinicSummary {
  id: string;
  name: string;
  slug: string;
  ownerEmail?: string;
  customDomain?: string;
  leadCount: number;
  checkupCount: number;
  checkupLimit?: number;
  isPilot?: boolean;
  lastActive?: string;
  type?: 'real' | 'prospect';
  isActive?: boolean;
  trafficWeight?: number;
  contactChannel?: 'whatsapp' | 'instagram';
  instagramHandle?: string;
}

export async function getAllClinics(type?: 'real' | 'prospect'): Promise<ClinicSummary[]> {
  await verifyAdmin();

  try {
    let query: any = adminDb.collection('clinics');
    
    if (type) {
        query = query.where('type', '==', type);
    }

    const clinicsSnap = await query.get();

    // ✅ OPTIMIZED: Use pre-calculated counters from Cloud Functions
    // No N+1 query problem - single query instead of N+1
    const clinics = clinicsSnap.docs.map((doc: any) => {
        const data = doc.data();

        return {
            id: doc.id,
            name: data.name || 'Unnamed Clinic',
            slug: data.slug || 'no-slug',
            ownerEmail: data.ownerEmail,
            customDomain: data.customDomain,
            leadCount: data.leadCount || 0,
            checkupCount: data.checkupCount || 0,
            checkupLimit: data.limits?.checkups,
            isPilot: data.isPilot || false,
            type: data.type || 'real',
            isActive: data.isActive !== undefined ? data.isActive : true,
            trafficWeight: data.trafficWeight || 0,
            contactChannel: data.contactChannel || 'whatsapp',
            instagramHandle: data.instagramHandle || '',
            lastActive: data.lastLeadAt ? data.lastLeadAt.toDate().toISOString() :
                        data.updatedAt ? data.updatedAt.toDate().toISOString() :
                        undefined
        };
    });

    if (type === 'prospect') {
        return clinics.sort((a: any, b: any) => (b.trafficWeight || 0) - (a.trafficWeight || 0));
    }

    return clinics.sort((a: any, b: any) => b.leadCount - a.leadCount); // Sort by most active
  } catch (error) {
    console.error("Failed to fetch clinics for admin:", error);
    return [];
  }
}

export interface GlobalLead {
    id: string;
    clinicId: string;
    clinicName?: string;
    phone: string;
    email?: string;
    status: string;
    createdAt: any;
    diagnosticType: string;
    revenue?: number; // Actual revenue when converted
}

export interface PaginatedLeads {
    leads: GlobalLead[];
    nextCursor?: string;
    hasMore: boolean;
    total?: number;
}

/**
 * Get all leads with cursor-based pagination
 *
 * @param filterClinicId - Filter by clinic ID or 'all'
 * @param limit - Number of leads per page (default: 50)
 * @param cursor - Pagination cursor (last document ID from previous page)
 * @returns Paginated leads with next cursor
 */
export async function getAllLeads(
    filterClinicId?: string,
    limit: number = 50,
    cursor?: string
): Promise<PaginatedLeads> {
    await verifyAdmin();

    try {
        let query = adminDb.collection('leads');

        // Apply clinic filter if specified
        if (filterClinicId && filterClinicId !== 'all') {
            query = query.where('clinicId', '==', filterClinicId) as any;
        }

        // Always order by createdAt for consistent pagination
        query = query.orderBy('createdAt', 'desc') as any;

        // Apply cursor for pagination
        if (cursor) {
            const cursorDoc = await adminDb.collection('leads').doc(cursor).get();
            if (cursorDoc.exists) {
                query = query.startAfter(cursorDoc) as any;
            }
        }

        // Fetch limit + 1 to check if there are more results
        query = query.limit(limit + 1) as any;

        const leadsSnap = await query.get();

        // Check if there are more results
        const hasMore = leadsSnap.docs.length > limit;
        const docs = hasMore ? leadsSnap.docs.slice(0, limit) : leadsSnap.docs;

        // Next cursor is the last document ID
        const nextCursor = hasMore && docs.length > 0 ? docs[docs.length - 1].id : undefined;

        // Cache clinic names to avoid N+1 queries
        const clinicNames: Record<string, string> = {};

        const leads = await Promise.all(docs.map(async (doc: any) => {
            const data = doc.data();
            const cId = data.clinicId;

            if (!clinicNames[cId]) {
                const cSnap = await adminDb.collection('clinics').doc(cId).get();
                clinicNames[cId] = cSnap.exists ? cSnap.data()?.name : 'Unknown';
            }

            return {
                id: doc.id,
                clinicId: cId,
                clinicName: clinicNames[cId],
                phone: data.phone,
                email: data.email,
                status: data.status,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
                diagnosticType: data.diagnosticType,
                revenue: data.revenue || undefined
            };
        }));

        return {
            leads,
            nextCursor,
            hasMore
        };
    } catch (error) {
        console.error("Failed to fetch global leads:", error);
        return {
            leads: [],
            hasMore: false
        };
    }
}

export async function getClinicStats(clinicId: string) {
    await verifyAdmin();

    try {
        // ✅ OPTIMIZED: Read from clinic counters first
        const clinicDoc = await adminDb.collection('clinics').doc(clinicId).get();

        if (!clinicDoc.exists) {
            return null;
        }

        const clinicData = clinicDoc.data()!;

        // Use pre-calculated counters from Cloud Functions
        const totalLeads = clinicData.leadCount || 0;
        const newLeads = clinicData.newLeadCount || 0;
        const converted = clinicData.convertedCount || 0;
        const stats = clinicData.stats || { new: 0, contacted: 0, qualified: 0, converted: 0, lost: 0 };
        const revenue = clinicData.totalRevenue || 0;

        // For source tracking, we still need to query leads (but only once)
        // This is acceptable as it's not N+1 - just 1 additional query
        const leadsSnap = await adminDb.collection('leads')
            .where('clinicId', '==', clinicId)
            .get();

        const sources: Record<string, number> = {};
        leadsSnap.docs.forEach(doc => {
            const data = doc.data();
            const source = data.tracking?.source || 'Direct';
            sources[source] = (sources[source] || 0) + 1;
        });

        // Estimate revenue if not tracked explicitly (e.g. 5000 RUB avg check)
        const estimatedRevenue = converted * 5000;

        return {
            totalLeads,
            newLeads,
            converted,
            conversionRate: totalLeads > 0 ? ((converted / totalLeads) * 100).toFixed(1) : '0.0',
            revenue: revenue || estimatedRevenue,
            topSources: Object.entries(sources)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5),
            stats, // Include per-status breakdown
        };
    } catch (error) {
        console.error("Stats error:", error);
        return null;
    }
}
