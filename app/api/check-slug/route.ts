import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return NextResponse.json({ error: 'Slug required' }, { status: 400 })
  }

  try {
    const q = await adminDb.collection('clinics').where('slug', '==', slug).limit(1).get();
    const isAvailable = q.empty;
    return NextResponse.json({ available: isAvailable })
  } catch (error) {
    console.error('Check slug error:', error)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
