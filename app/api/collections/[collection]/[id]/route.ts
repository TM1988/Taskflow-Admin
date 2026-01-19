import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/db';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const params = await context.params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection(params.collection);

    // Convert string ID to ObjectId if it's a valid ObjectId format
    let query: any = { _id: params.id };
    if (ObjectId.isValid(params.id)) {
      query = { _id: new ObjectId(params.id) };
    }

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const params = await context.params;
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection(params.collection);

    // Convert string ID to ObjectId if it's a valid ObjectId format
    let query: any = { _id: params.id };
    if (ObjectId.isValid(params.id)) {
      query = { _id: new ObjectId(params.id) };
    }

    const document = await collection.findOne(query);

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });
  } catch (error: any) {
    console.error('Get error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch document' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ collection: string; id: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection(params.collection);

    // Remove _id from update body if present
    const { _id, ...updateData } = body;

    // Convert string ID to ObjectId if it's a valid ObjectId format
    let query: any = { _id: params.id };
    if (ObjectId.isValid(params.id)) {
      query = { _id: new ObjectId(params.id) };
    }

    const result = await collection.updateOne(
      query,
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: 'Document updated successfully'
    });
  } catch (error: any) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update document' },
      { status: 500 }
    );
  }
}
