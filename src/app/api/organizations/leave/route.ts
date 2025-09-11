import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

// POST /api/organizations/leave - Leave the current organization
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user?.organizationId) {
    return NextResponse.json({ error: 'User is not in an organization.' }, { status: 400 });
  }
  
  try {
    // Note: In a more complex app, you might check if the user is the *last*
    // user in an organization and handle that case (e.g., by archiving the org).
    // For now, we'll just allow them to leave.

    await prisma.user.update({
      where: { id: session.user.id },
      data: { organizationId: null }, // Set organizationId to null
    });

    return NextResponse.json({ message: 'Successfully left organization.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to leave organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}