import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

/**
 * Handles GET requests to /api/assessment-templates
 * Fetches all available assessment templates.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const templates = await prisma.assessmentTemplate.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to fetch assessment templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}