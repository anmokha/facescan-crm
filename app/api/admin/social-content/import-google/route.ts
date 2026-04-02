import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, requireClinicAccess } from '@/lib/auth/verifyAdmin';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * POST /api/admin/social-content/import-google
 * Import reviews from Google Maps
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request);
    const body = await request.json();
    const { clinicId, url, query } = body;

    if (!clinicId) {
      return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 });
    }

    requireClinicAccess(adminUser, clinicId);

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Google Maps API Key not configured in Vercel. Please add GOOGLE_MAPS_API_KEY to environment variables.' 
      }, { status: 500 });
    }

    // 1. Find the Place ID
    // If user provided a query (clinic name), use it. If URL, try to search for it.
    const searchParams = new URLSearchParams({
      query: query || url,
      key: apiKey,
    });

    const searchRes = await fetch(`https://maps.googleapis.com/maps/api/place/textsearch/json?${searchParams.toString()}`);
    const searchData = await searchRes.json();

    if (!searchData.results || searchData.results.length === 0) {
      return NextResponse.json({ error: 'Place not found' }, { status: 404 });
    }

    const placeId = searchData.results[0].place_id;

    // 2. Fetch Place Details (Reviews)
    const detailParams = new URLSearchParams({
      place_id: placeId,
      fields: 'name,rating,reviews,url',
      key: apiKey,
    });

    const detailRes = await fetch(`https://maps.googleapis.com/maps/api/place/details/json?${detailParams.toString()}`);
    const detailData = await detailRes.json();

    if (!detailData.result) {
      return NextResponse.json({ error: 'Failed to fetch place details' }, { status: 500 });
    }

    const place = detailData.result;
    const reviews = (place.reviews || []).map((r: any) => ({
      type: 'google_review',
      author: r.author_name,
      rating: r.rating,
      text: r.text,
      date: r.relative_time_description,
      originalUrl: place.url,
      isActive: true,
      procedureKeywords: [] // To be filled by AI match later or in this call
    }));

    return NextResponse.json({ 
      clinicName: place.name,
      rating: place.rating,
      reviews 
    });
  } catch (error: any) {
    console.error('Google Import Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
