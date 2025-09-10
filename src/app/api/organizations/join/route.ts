import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

// POST /api/organizations/join - Join an organization
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (user?.organizationId) {
    return NextResponse.json({ error: 'User is already in an organization.' }, { status: 400 });
  }
  
  try {
    const { inviteCode } = await request.json();
    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code is required.' }, { status: 400 });
    }

    const organization = await prisma.organization.findUnique({
      where: { inviteCode },
    });

    if (!organization) {
      return NextResponse.json({ error: 'Invalid invite code.' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { organizationId: organization.id },
    });

    return NextResponse.json({ message: 'Successfully joined organization.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to join organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}