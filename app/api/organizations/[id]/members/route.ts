import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/services/organizations/organization-service';

// Add member to organization
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orgId = params.id;
    const body = await request.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await organizationService.addMember(orgId, userId, email);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Add member error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add member' },
      { status: 500 }
    );
  }
}

// Remove member from organization
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orgId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    await organizationService.removeMember(orgId, userId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to remove member' },
      { status: 500 }
    );
  }
}
