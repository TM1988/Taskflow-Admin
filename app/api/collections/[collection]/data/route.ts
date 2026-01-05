import { NextRequest, NextResponse } from 'next/server';
import { insertDocument, updateDocument, deleteDocument, bulkUpdateDocuments, bulkDeleteDocuments } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Create document
export async function POST(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const body = await request.json();
    const result = await insertDocument(params.collection, body);
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create document' },
      { status: 500 }
    );
  }
}

// Update document
export async function PUT(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const body = await request.json();
    const { _id, bulk, filter, ...update } = body;
    
    if (bulk && filter) {
      // Bulk update
      const result = await bulkUpdateDocuments(params.collection, filter, update);
      return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
    } else if (_id) {
      // Single update
      const result = await updateDocument(
        params.collection,
        { _id: new ObjectId(_id) },
        update
      );
      return NextResponse.json({ success: true, modifiedCount: result.modifiedCount });
    } else {
      return NextResponse.json(
        { error: 'Missing _id or filter parameter' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update document' },
      { status: 500 }
    );
  }
}

// Delete document
export async function DELETE(
  request: NextRequest,
  { params }: { params: { collection: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const bulk = searchParams.get('bulk') === 'true';
    const filter = searchParams.get('filter');
    
    if (bulk && filter) {
      // Bulk delete
      const result = await bulkDeleteDocuments(params.collection, JSON.parse(filter));
      return NextResponse.json({ success: true, deletedCount: result.deletedCount });
    } else if (id) {
      // Single delete
      const result = await deleteDocument(
        params.collection,
        { _id: new ObjectId(id) }
      );
      return NextResponse.json({ success: true, deletedCount: result.deletedCount });
    } else {
      return NextResponse.json(
        { error: 'Missing id or filter parameter' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete document' },
      { status: 500 }
    );
  }
}
