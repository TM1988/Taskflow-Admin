import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/services/organizations/organization-service';

// Get organization by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orgId = params.id;

    const organization = await organizationService.getOrganization(orgId);

    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ organization });
  } catch (error: any) {
    console.error('Get organization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get organization' },
      { status: 500 }
    );
  }
}

// Update organization
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orgId = params.id;
    const body = await request.json();
    const { name, slug } = body;

    if (name) {
      await organizationService.updateName(orgId, name);
    }

    if (slug) {
      await organizationService.updateSlug(orgId, slug);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update organization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update organization' },
      { status: 500 }
    );
  }
}

// Delete organization
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orgId = params.id;
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const org = await organizationService.getOrganization(orgId);
    
    if (!org || org.ownerId !== userId) {
      return NextResponse.json(
        { error: 'Only organization owner can delete' },
        { status: 403 }
      );
    }

    await organizationService.deleteOrganization(orgId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete organization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete organization' },
      { status: 500 }
    );
  }
}
