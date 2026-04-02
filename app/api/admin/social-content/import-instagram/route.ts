import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken, requireClinicAccess } from '@/lib/auth/verifyAdmin';

/**
 * POST /api/admin/social-content/import-instagram
 * Resolve Instagram URL to Post Data (Image + Caption)
 */
export async function POST(request: NextRequest) {
  try {
    const adminUser = await verifyAdminToken(request);
    const body = await request.json();
    const { clinicId, url } = body;

    if (!clinicId || !url) {
      return NextResponse.json({ error: 'Missing clinicId or url' }, { status: 400 });
    }

    requireClinicAccess(adminUser, clinicId);

    const rapidApiKey = process.env.RAPIDAPI_KEY;
    if (!rapidApiKey) {
      return NextResponse.json({ 
        error: 'RapidAPI Key not configured. Please add RAPIDAPI_KEY to environment variables.' 
      }, { status: 500 });
    }

    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'instagram-api-fast-reliable-data-scraper.p.rapidapi.com'
      }
    };

    // Extract shortcode from URL
    const shortcodeMatch = url.match(/\/(?:p|reels|reel)\/([A-Za-z0-9_-]+)/);
    if (!shortcodeMatch) {
      return NextResponse.json({ error: 'Invalid Instagram URL' }, { status: 400 });
    }
    const shortcode = shortcodeMatch[1];

    const res = await fetch(`https://instagram-api-fast-reliable-data-scraper.p.rapidapi.com/v1/post_info?code=${shortcode}`, options);
    const data = await res.json();

    // Log for debugging in Vercel
    console.log('Instagram Scraper Response:', JSON.stringify(data).substring(0, 500) + '...');

    if (!data || (!data.id && !data.pk)) {
        return NextResponse.json({ 
            error: 'Failed to fetch Instagram data. API returned no ID.', 
            details: data 
        }, { status: 500 });
    }

    // Map fields from the provided JSON structure
    const post = {
        type: 'instagram_post',
        mediaUrl: data.image_versions2?.candidates?.[0]?.url,
        mediaType: data.media_type === 1 ? 'image' : (data.media_type === 2 ? 'video' : 'carousel'),
        caption: data.caption?.text || '',
        permalink: `https://www.instagram.com/p/${shortcode}/`,
        isActive: true
    };

    return NextResponse.json({ post });
  } catch (error: any) {
    console.error('Instagram Import Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
