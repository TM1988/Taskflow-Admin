import { NextRequest, NextResponse } from 'next/server';
import { organizationService } from '@/services/organizations/organization-service';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await context.params;
    const slug = params.slug;

    const available = await organizationService.isSlugAvailable(slug);

    return NextResponse.json({ available });
  } catch (error: any) {
    console.error('Check slug error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check slug availability' },
      { status: 500 }
    );
  }
}
