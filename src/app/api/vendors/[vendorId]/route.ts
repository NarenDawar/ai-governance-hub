import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';
import { Role } from '@prisma/client'; // Import Role

/**
 * Handles GET requests to /api/vendors/[vendorId]
 */
export async function GET(
  request: Request,
  { params }: { params: { vendorId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { vendorId } = params;
    const vendor = await prisma.vendor.findUnique({
      where: {
        id: vendorId,
        organizationId: session.user.organizationId,
      },
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
 */
export async function PATCH(
  request: Request,
  { params }: { params: { vendorId: string } }
) {
    const session = await getServerSession(authOptions);
    // --- MODIFIED: Add Role Check ---
    if (!session?.user?.organizationId || session.user.role !== Role.ADMIN) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { vendorId } = params;
        const body = await request.json();
        const { name, website } = body;

        if (!name || !website) {
            return NextResponse.json({ error: 'Name and website are required.' }, { status: 400 });
        }
        
        const updatedVendor = await prisma.vendor.update({
            where: {
                id: vendorId,
                organizationId: session.user.organizationId,
            },
            data: { name, website },
        });

        return NextResponse.json(updatedVendor, { status: 200 });

    } catch (error) {
        console.error('Failed to update vendor:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

/**
 * Handles DELETE requests to /api/vendors/[vendorId]
 */
export async function DELETE(
  request: Request,
  { params }: { params: { vendorId: string } }
) {
  const session = await getServerSession(authOptions);
  // --- MODIFIED: Add Role Check ---
  if (!session?.user?.id || !session.user.organizationId || session.user.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { vendorId } = params;
    
    const vendor = await prisma.vendor.findFirst({
      where: { id: vendorId, organizationId: session.user.organizationId },
      include: { aiAssets: true },
    });

    if (!vendor) {
      return NextResponse.json({ error: 'Vendor not found or permission denied.' }, { status: 404 });
    }

    if (vendor.aiAssets.length > 0) {
      return NextResponse.json({ error: 'Cannot delete vendor. Please reassign or delete associated AI assets first.' }, { status: 409 });
    }

    await prisma.vendor.delete({
      where: { id: vendorId },
    });

    return NextResponse.json({ message: 'Vendor deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete vendor:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}