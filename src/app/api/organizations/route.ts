import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { Role } from '@prisma/client'; // Import the Role enum

// POST /api/organizations - Create a new organization
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
    const { name } = await request.json();
    if (!name) {
      return NextResponse.json({ error: 'Organization name is required.' }, { status: 400 });
    }

    // --- MODIFIED: Use a transaction to create org and make user an admin ---
    const newOrganization = await prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: {
          organizationId: org.id,
          role: Role.ADMIN, // Promote the creator to ADMIN
        },
      });

      return org;
    });
    // --------------------------------------------------------------------

    return NextResponse.json(newOrganization, { status: 201 });
  } catch (error) {
    console.error('Failed to create organization:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}