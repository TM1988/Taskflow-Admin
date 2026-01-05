import { NextResponse } from 'next/server';
import { discoverCollections } from '@/lib/mongodb';

export async function GET() {
  try {
    const collections = await discoverCollections();
    return NextResponse.json({ collections });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to discover collections' },
      { status: 500 }
    );
  }
}
