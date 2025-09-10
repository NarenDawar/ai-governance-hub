import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';

/**
 * Handles GET requests to /api/assets/[assetId]/auditlog
 * Fetches all audit log entries for a specific AI asset.
 */
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

    // First verify the asset belongs to the user's organization
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
        createdAt: 'desc', // Show the most recent events first
      },
    });

    return NextResponse.json(auditLogs);
  } catch (error) {
    console.error('Failed to fetch audit log:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

