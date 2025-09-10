import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

// GET /api/organizations/me - Get the current user's organization
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.organizationId) {
    return NextResponse.json(null); // No organization found
  }

  try {
    const organization = await prisma.organization.findUnique({
      where: {
        id: session.user.organizationId,
      },
    });

    return NextResponse.json(organization);
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}