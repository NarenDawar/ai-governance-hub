import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';

/**
 * Handles GET requests to /api/vendors
 * Fetches all vendors from the database.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const vendors = await prisma.vendor.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(vendors);
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Handles POST requests to /api/vendors
 * Creates a new vendor in the database.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { name, website } = body;

    if (!name || !website) {
      return NextResponse.json({ error: 'Name and website are required.' }, { status: 400 });
    }

    const newVendor = await prisma.vendor.create({
      data: {
        name,
        website,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(newVendor, { status: 201 });
  } catch (error) {
    // Handle potential unique constraint violation for vendor name
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'A vendor with this name already exists.' }, { status: 409 });
    }
    console.error('Failed to create vendor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
