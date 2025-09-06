import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

/**
 * Handles GET requests to /api/assets/[assetId]/auditlog
 * Fetches all audit log entries for a specific AI asset.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;

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

