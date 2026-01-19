import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/services/organizations/organization-service';

// Get organization by invite code
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Invite code required' },
        { status: 400 }
      );
    }

    const organization = await organizationService.getOrganizationByInviteCode(code);

    if (!organization) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug
      }
    });
  } catch (error: any) {
    console.error('Get invite error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate invite' },
      { status: 500 }
    );
  }
}

// Join organization with invite code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, email } = body;

    if (!code || !userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const organization = await organizationService.getOrganizationByInviteCode(code);

    if (!organization) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    await organizationService.addMember(organization.id, userId, email);

    return NextResponse.json({ 
      success: true,
      organizationId: organization.id
    });
  } catch (error: any) {
    console.error('Join organization error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join organization' },
      { status: 500 }
    );
  }
}
