import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

/**
 * Handles GET requests to /api/vendors/[vendorId]
 * Fetches a single vendor and its associated AI assets.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
  try {
    const { vendorId } = await params; // CORRECTED: Added 'await' here
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
      include: {
        aiAssets: {
          orderBy: {
            name: 'asc'
          }
        },
      },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
    }

    return NextResponse.json(vendor);
  } catch (error) {
    console.error('Failed to fetch vendor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


/**
 * Handles PATCH requests to /api/vendors/[vendorId]
 * Updates a vendor's status.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ vendorId: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const { vendorId } = await params; // CORRECTED: Added 'await' here
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required.' }, { status: 400 });
        }
        
        const updatedVendor = await prisma.vendor.update({
            where: { id: vendorId },
            data: { status },
        });

        return NextResponse.json(updatedVendor, { status: 200 });

    } catch (error) {
        console.error('Failed to update vendor status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}