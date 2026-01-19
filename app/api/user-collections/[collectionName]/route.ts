import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB_NAME || 'taskflow-admin';

async function getOrgId(request: NextRequest): Promise<string | null> {
  const orgId = request.headers.get('x-org-id');
  return orgId;
}

/**
 * DELETE - Delete an organization's collection
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { collectionName: string } }
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
    const { collectionName } = params;
    const fullCollectionName = `${orgId}_${collectionName}`;

    await client.connect();
    const db = client.db(DB_NAME);

    // Check if collection exists
    const existingCollections = await db.listCollections({ name: fullCollectionName }).toArray();
    if (existingCollections.length === 0) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Drop the collection
    await db.collection(fullCollectionName).drop();

    // Update metadata
    await db.collection('orgCollectionsMeta').updateOne(
      { orgId },
      {
        $pull: { collections: collectionName } as any,
        $set: { updatedAt: new Date() }
      }
    );

    return NextResponse.json({
      success: true,
      message: `Collection ${collectionName} deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting organization collection:', error);
    return NextResponse.json(
      { error: 'Failed to delete collection' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
