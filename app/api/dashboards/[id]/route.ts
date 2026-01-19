import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;
const DB_NAME = process.env.MONGODB_DB_NAME || 'taskflow-admin';

/**
 * GET - Get a specific dashboard
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orgId = request.headers.get('x-org-id');
  
  if (!orgId) {
    return NextResponse.json(
      { error: 'Unauthorized - Organization ID required' },
      { status: 401 }
    );
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    const { id } = params;
    
    await client.connect();
    const db = client.db(DB_NAME);
    
    const dashboard = await db.collection('dashboards').findOne({
      _id: new ObjectId(id),
      organizationId: orgId
    });

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      dashboard: { ...dashboard, id: dashboard._id.toString() }
    });
  } catch (error: any) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

/**
 * PUT - Update a dashboard
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orgId = request.headers.get('x-org-id');
  
  if (!orgId) {
    return NextResponse.json(
      { error: 'Unauthorized - Organization ID required' },
      { status: 401 }
    );
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    const { id } = params;
    const body = await request.json();
    const { name, blocks, layout } = body;

    await client.connect();
    const db = client.db(DB_NAME);

    const updateData: any = {
      updatedAt: new Date()
    };

    if (name !== undefined) updateData.name = name;
    if (blocks !== undefined) updateData.blocks = blocks;
    if (layout !== undefined) updateData.layout = layout;

    const result = await db.collection('dashboards').updateOne(
      {
        _id: new ObjectId(id),
        organizationId: orgId
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dashboard updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to update dashboard' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

/**
 * DELETE - Delete a dashboard
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orgId = request.headers.get('x-org-id');
  
  if (!orgId) {
    return NextResponse.json(
      { error: 'Unauthorized - Organization ID required' },
      { status: 401 }
    );
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    const { id } = params;
    
    await client.connect();
    const db = client.db(DB_NAME);
    
    const result = await db.collection('dashboards').deleteOne({
      _id: new ObjectId(id),
      organizationId: orgId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dashboard deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting dashboard:', error);
    return NextResponse.json(
      { error: 'Failed to delete dashboard' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
