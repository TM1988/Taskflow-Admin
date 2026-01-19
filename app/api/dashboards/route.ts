import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB_NAME || 'taskflow-admin';

/**
 * GET - List all dashboards for an organization
 */
export async function GET(request: NextRequest) {
  const orgId = request.headers.get('x-org-id');
  
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
    
    const dashboards = await db
      .collection('dashboards')
      .find({ organizationId: orgId })
      .sort({ updatedAt: -1 })
      .toArray();

    return NextResponse.json({ dashboards });
  } catch (error: any) {
    console.error('Error fetching dashboards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboards' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

/**
 * POST - Create a new dashboard
 */
export async function POST(request: NextRequest) {
  const orgId = request.headers.get('x-org-id');
  const userId = request.headers.get('x-user-id');
  
  if (!orgId || !userId) {
    return NextResponse.json(
      { error: 'Unauthorized - Organization ID and User ID required' },
      { status: 401 }
    );
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    const body = await request.json();
    const { name, blocks, layout } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Dashboard name is required' },
        { status: 400 }
      );
    }

    await client.connect();
    const db = client.db(DB_NAME);

    const dashboard = {
      organizationId: orgId,
      name,
      blocks: blocks || [],
      layout: layout || [],
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('dashboards').insertOne(dashboard);

    return NextResponse.json({
      success: true,
      dashboardId: result.insertedId.toString(),
      dashboard: { ...dashboard, id: result.insertedId.toString() }
    });
  } catch (error: any) {
    console.error('Error creating dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to create dashboard' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
