import { NextRequest, NextResponse } from 'next/server';
import { getCollectionData } from '@/lib/mongodb';
import clientPromise from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  try {
    const params = await context.params;
    const orgId = request.headers.get('x-org-id');
    
    if (!orgId) {
      return NextResponse.json(
        { error: 'Unauthorized - Organization ID required' },
        { status: 401 }
      );
    }

    // Prefix collection name with org ID
    const fullCollectionName = `${orgId}_${params.collection}`;
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');
    const filter = searchParams.get('filter');
    
    const options: any = { page, limit };
    
    // Handle sortBy/sortOrder parameters
    if (sortBy) {
      options.sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    } else if (sort) {
      try {
        options.sort = JSON.parse(sort);
      } catch (e) {
        // Invalid sort, ignore
      }
    }
    
    // Handle search parameter (simple text search across all fields)
    if (search) {
      options.filter = { $text: { $search: search } };
    } else if (filter) {
      try {
        options.filter = JSON.parse(filter);
      } catch (e) {
        // Invalid filter, ignore
      }
    }
    
    const result = await getCollectionData(fullCollectionName, options);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch collection data' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ collection: string }> }
) {
  try {
    const params = await context.params;
    const orgId = request.headers.get('x-org-id');
    
    if (!orgId) {
      return NextResponse.json(
        { error: 'Unauthorized - Organization ID required' },
        { status: 401 }
      );
    }

    // Prefix collection name with org ID
    const fullCollectionName = `${orgId}_${params.collection}`;
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'taskflow_admin');
    
    // Drop the collection
    await db.collection(fullCollectionName).drop();
    
    return NextResponse.json({ 
      success: true,
      message: `Collection ${params.collection} deleted successfully` 
    });
  } catch (error: any) {
    // Collection might not exist, which is fine
    if (error.message && error.message.includes('ns not found')) {
      return NextResponse.json({ 
        success: true,
        message: 'Collection already deleted or does not exist' 
      });
    }
    
    return NextResponse.json(
      { error: error.message || 'Failed to delete collection' },
      { status: 500 }
    );
  }
}
