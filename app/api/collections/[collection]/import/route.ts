import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB_NAME || 'taskflow-admin';

async function getOrgId(request: NextRequest): Promise<string | null> {
  const orgId = request.headers.get('x-org-id');
  return orgId;
}

/**
 * POST - Import data into a collection
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  const orgId = await getOrgId(request);
  
  if (!orgId) {
    return NextResponse.json(
      { error: 'Unauthorized - Organization ID required' },
      { status: 401 }
    );
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    const { collection } = params;
    const fullCollectionName = `${orgId}_${collection}`;
    const body = await request.json();
    const { data } = body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Data array is required and must not be empty' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db(DB_NAME);

    // Insert documents
    const result = await db.collection(fullCollectionName).insertMany(data);

    return NextResponse.json({
      success: true,
      insertedCount: result.insertedCount,
      insertedIds: Object.values(result.insertedIds),
      message: `Successfully imported ${result.insertedCount} documents`
    });
  } catch (error: any) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to import data' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
