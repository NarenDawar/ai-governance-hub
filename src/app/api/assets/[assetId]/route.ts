import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth'; // Corrected import path
import prisma from '../../../../lib/prisma';
import { AssetStatus, RiskLevel } from '@prisma/client';
import { createAuditLog } from '../../../../lib/auditLog';

/**
 * Handles GET requests to /api/assets/[assetId]
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
    const asset = await prisma.aIAsset.findFirst({
      where: { 
        id: assetId,
        organizationId: session.user.organizationId,
      },
      include: {
        vendor: {
          select: {
            name: true,
          },
        },
      },
    });
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }
    return NextResponse.json(asset, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch asset:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Handles PATCH requests to /api/assets/[assetId]
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  // Get the current user's session
  const session = await getServerSession(authOptions);
  // If no session or user ID, deny access
  if (!session || !session.user?.id || !session.user?.organizationId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { assetId } = await params;
    const body = await request.json();
    const { status, riskClassification } = body;

    const isValidStatus = status ? Object.values(AssetStatus).includes(status) : true;
    const isValidRisk = riskClassification ? Object.values(RiskLevel).includes(riskClassification) : true;

    if (!isValidStatus || !isValidRisk) {
      return NextResponse.json({ error: 'Invalid status or risk value provided.' }, { status: 400 });
    }

    // Fetch the asset's current state BEFORE updating for a more detailed log and verify organization access
    const originalAsset = await prisma.aIAsset.findFirst({ 
      where: { 
        id: assetId,
        organizationId: session.user.organizationId,
      },
    });

    if (!originalAsset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    const updatedAsset = await prisma.aIAsset.update({
      where: { id: assetId },
      data: { status, riskClassification },
    });

    // Create a detailed audit log entry based on what changed
    const details = [];
    if (status && originalAsset?.status !== status) {
      details.push(`Status changed from ${originalAsset?.status} to ${status}.`);
    }
    if (riskClassification && originalAsset?.riskClassification !== riskClassification) {
      details.push(`Risk changed from ${originalAsset?.riskClassification} to ${riskClassification}.`);
    }

    if (details.length > 0) {
      await createAuditLog(
        'ASSET_UPDATED', 
        details.join(' '), 
        assetId, 
        session.user.id
      );
    }

    return NextResponse.json(updatedAsset, { status: 200 });
  } catch (error) {
    console.error('Failed to update asset:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.organizationId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { assetId } = await params;

    const asset = await prisma.aIAsset.findFirst({
      where: { id: assetId, organizationId: session.user.organizationId },
    });

    if (!asset) {
      return NextResponse.json({ error: 'Asset not found or permission denied.' }, { status: 404 });
    }

    await prisma.aIAsset.delete({
      where: { id: assetId },
    });
    
    // It's good practice to log deletions, but the assetId won't exist anymore.
    // We log it manually without a direct relation.
    await createAuditLog('ASSET_DELETED', `Asset "${asset.name}" was deleted.`, null, session.user.id);

    return NextResponse.json({ message: 'Asset deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete asset:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

