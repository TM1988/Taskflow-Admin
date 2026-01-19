import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/services/organizations/organization-service';

// Regenerate invite code
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const orgId = params.id;

    const newCode = await organizationService.regenerateInviteCode(orgId);

    return NextResponse.json({ 
      success: true,
      inviteCode: newCode
    });
  } catch (error: any) {
    console.error('Regenerate invite code error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to regenerate invite code' },
      { status: 500 }
    );
  }
}
