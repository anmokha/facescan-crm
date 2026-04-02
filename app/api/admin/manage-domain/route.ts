
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminAuth } from '@/lib/firebaseAdmin'

export async function POST(request: NextRequest) {
  try {
    // 1. Admin Authentication Check
    const session = cookies().get('__session')?.value;
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = await adminAuth.verifySessionCookie(session, true).catch(() => null);
    if (!decoded?.admin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { domain } = await request.json()
    
    if (!domain) {
      return NextResponse.json({ error: 'Domain is required' }, { status: 400 })
    }

    // Check for environment variables
    const token = process.env.VERCEL_API_TOKEN
    const projectId = process.env.VERCEL_PROJECT_ID
    const teamId = process.env.VERCEL_TEAM_ID

    if (!token || !projectId) {
      // If credentials are not set up, we log it but don't fail hard (MVP mode)
      // This allows the UI to proceed even if automation isn't configured yet.
      console.warn('Vercel API credentials not found. Skipping automated domain registration.')
      return NextResponse.json({ 
        success: false, 
        message: 'API configuration missing',
        configured: false 
      })
    }

    // Construct Vercel API URL
    let url = `https://api.vercel.com/v10/projects/${projectId}/domains`
    if (teamId) url += `?teamId=${teamId}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: domain }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Vercel API Error:', errorData)
      return NextResponse.json({ error: errorData.error?.message || 'Failed to add domain' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Domain management error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
