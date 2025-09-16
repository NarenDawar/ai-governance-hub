import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import { Role } from '@prisma/client';

/**
 * GET /api/organizations/users
 * Fetches all users for the current user's organization.
 * Admin-only endpoint.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      where: { organizationId: session.user.organizationId },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * PATCH /api/organizations/users
 * Updates a user's role.
 * Admin-only endpoint.
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.organizationId || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { userId, role } = await request.json();
    if (!userId || !role || !Object.values(Role).includes(role)) {
      return NextResponse.json({ error: 'User ID and a valid role are required.' }, { status: 400 });
    }

    // Prevent an admin from demoting themselves if they are the last one
    if (session.user.id === userId && role !== Role.ADMIN) {
      const adminCount = await prisma.user.count({
        where: {
          organizationId: session.user.organizationId,
          role: Role.ADMIN,
        },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot demote the last admin.' }, { status: 409 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user role:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}