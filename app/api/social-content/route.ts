import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * GET /api/social-content?clinicId=X&procedure=Y
 * Public API to fetch social proof for AnalysisView
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const procedure = searchParams.get('procedure');

    if (!clinicId) {
      return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 });
    }

    // Initialize query
    let query = adminDb.collection('clinics').doc(clinicId).collection('social_content')
      .where('isActive', '==', true);

    const snapshot = await query.orderBy('order', 'asc').get();
    
    let content = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data()
    }));

    // Semantic filtering if procedure is provided
    if (procedure) {
      const pLower = procedure.toLowerCase();
      content = content.filter((item: any) => {
        if (!item.procedureKeywords || item.procedureKeywords.length === 0) return true; // Generic content
        return item.procedureKeywords.some((k: string) => 
          pLower.includes(k.toLowerCase()) || k.toLowerCase().includes(pLower)
        );
      });
    }

    // Limit to reasonable amount
    const reviews = content.filter((item: any) => item.type === 'google_review').slice(0, 3);
    const posts = content.filter((item: any) => item.type === 'instagram_post').slice(0, 4);

    return NextResponse.json({ reviews, posts });
  } catch (error: any) {
    console.error('Public Social API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
