import { NextRequest, NextResponse } from 'next/server';
import { getCollectionData } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  try {
    const params = await context.params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sort = searchParams.get('sort');
    const filter = searchParams.get('filter');
    
    const options: any = { page, limit };
    
    if (sort) {
      try {
        options.sort = JSON.parse(sort);
      } catch (e) {
        // Invalid sort, ignore
      }
    }
    
    if (filter) {
      try {
        options.filter = JSON.parse(filter);
      } catch (e) {
        // Invalid filter, ignore
      }
    }
    
    const result = await getCollectionData(params.collection, options);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch collection data' },
      { status: 500 }
    );
  }
}
