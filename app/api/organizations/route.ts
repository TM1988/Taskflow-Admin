import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/services/organizations/organization-service';

// Create organization
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, ownerId, ownerEmail } = body;

    if (!name || !slug || !ownerId || !ownerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric and hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'Invalid slug format. Use lowercase letters, numbers, and hyphens only.' },
        { status: 400 }
      );
    }

    const orgId = await organizationService.createOrganization({
      name,
      slug,
      ownerId,
      ownerEmail
    });

    return NextResponse.json({ 
      success: true, 
      organizationId: orgId 
    });
  } catch (error: any) {
    console.error('Create organization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create organization' },
      { status: 500 }
    );
  }
}

// Get user's organization
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      );
    }

    const organization = await organizationService.getUserOrganization(userId);

    if (!organization) {
      return NextResponse.json(
        { organization: null },
        { status: 200 }
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
