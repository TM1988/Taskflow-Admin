import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB_NAME || 'taskflow-admin';

// Helper to get orgId from request
async function getOrgId(request: NextRequest): Promise<string | null> {
  const orgId = request.headers.get('x-org-id');
  return orgId;
}

/**
 * GET - List all collections for the current organization
 */
export async function GET(request: NextRequest) {
  const orgId = await getOrgId(request);
  
  if (!orgId) {
    return NextResponse.json(
      { error: 'Unauthorized - Organization ID required' },
      { status: 401 }
    );
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);

    // Get all collections
    const allCollections = await db.listCollections().toArray();

    // Filter by organization prefix
    const orgPrefix = `${orgId}_`;
    const orgCollectionsData = allCollections
      .filter(col => col.name.startsWith(orgPrefix));

    // Get count and size for each collection
    const orgCollections = await Promise.all(
      orgCollectionsData.map(async (col) => {
        const collection = db.collection(col.name);
        const count = await collection.countDocuments();
        // Use collStats command instead of stats() method
        let size = 0;
        try {
          const stats = await db.command({ collStats: col.name });
          size = stats.size || 0;
        } catch (e) {
          // If collStats fails, just use 0
          size = 0;
        }
        
        return {
          name: col.name.replace(orgPrefix, ''),
          fullName: col.name,
          type: col.type || 'collection',
          count,
          size
        };
      })
    );

    // Get metadata if exists
    const metadata = await db
      .collection('orgCollectionsMeta')
      .findOne({ orgId });

    return NextResponse.json({
      collections: orgCollections,
      metadata: metadata || { orgId, collections: [] }
    });
  } catch (error) {
    console.error('Error fetching user collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

/**
 * POST - Create a new collection for the current organization
 */
export async function POST(request: NextRequest) {
  const orgId = await getOrgId(request);
  
  if (!orgId) {
    return NextResponse.json(
      { error: 'Unauthorized - Organization ID required' },
      { status: 401 }
    );
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    const body = await request.json();
    const { collectionName, initialData } = body;

    if (!collectionName || typeof collectionName !== 'string') {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    // Validate collection name (alphanumeric and underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(collectionName)) {
      return NextResponse.json(
        { error: 'Collection name must be alphanumeric with underscores only' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db(DB_NAME);

    const fullCollectionName = `${orgId}_${collectionName}`;

    // Check if collection already exists
    const existingCollections = await db.listCollections({ name: fullCollectionName }).toArray();
    if (existingCollections.length > 0) {
      return NextResponse.json(
        { error: 'Collection already exists' },
        { status: 409 }
      );
    }

    // Create the collection
    await db.createCollection(fullCollectionName);

    // Insert initial data if provided
    if (initialData && Array.isArray(initialData) && initialData.length > 0) {
      await db.collection(fullCollectionName).insertMany(initialData);
    }

    // Update metadata
    await db.collection('orgCollectionsMeta').updateOne(
      { orgId },
      {
        $addToSet: { collections: collectionName },
        $set: { updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    return NextResponse.json({
      success: true,
      collectionName: fullCollectionName,
      message: `Collection ${collectionName} created successfully`
    });
  } catch (error) {
    console.error('Error creating user collection:', error);
    return NextResponse.json(
      { error: 'Failed to create collection' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
