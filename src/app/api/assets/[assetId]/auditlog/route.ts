import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { assetId } = await params;

    const asset = await prisma.aIAsset.findFirst({
      where: {
        id: assetId,
        organizationId: session.user.organizationId,
      },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: {
        assetId: assetId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      // --- THIS IS THE FIX ---
      // Include the related user's name and email in the query
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      // ------------------------
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error('Failed to fetch audit log:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}