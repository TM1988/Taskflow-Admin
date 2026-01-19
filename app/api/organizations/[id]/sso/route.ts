import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/services/organizations/organization-service';

// Update SSO configuration
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orgId = params.id;
    const body = await request.json();
    const { ssoConfig } = body;

    if (!ssoConfig) {
      return NextResponse.json(
        { error: 'SSO configuration required' },
        { status: 400 }
      );
    }

    await organizationService.updateSSOConfig(orgId, ssoConfig);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update SSO config error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update SSO configuration' },
      { status: 500 }
    );
  }
}
