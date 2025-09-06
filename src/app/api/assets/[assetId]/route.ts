import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { AssetStatus, RiskLevel } from '@prisma/client';

/**
 * Handles GET requests to /api/assets/[assetId]
 */
export async function GET(
  request: Request,
  { params }: { params: { assetId: string } }
) {
  try {
    const assetId = params.assetId;
    const asset = await prisma.aIAsset.findUnique({
      where: { id: assetId },
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
 * THIS IS THE MISSING PART TO ADD BACK
 * Handles PATCH requests to /api/assets/[assetId]
 */
export async function PATCH(
  request: Request,
  { params }: { params: { assetId: string } }
) {
  try {
    const assetId = params.assetId;
    const body = await request.json();
    const { status, riskClassification } = body;

    const isValidStatus = status ? Object.values(AssetStatus).includes(status) : true;
    const isValidRisk = riskClassification ? Object.values(RiskLevel).includes(riskClassification) : true;

    if (!isValidStatus || !isValidRisk) {
      return NextResponse.json({ error: 'Invalid status or risk value provided.' }, { status: 400 });
    }

    const updatedAsset = await prisma.aIAsset.update({
      where: { id: assetId },
      data: { status, riskClassification },
    });

    return NextResponse.json(updatedAsset, { status: 200 });
  } catch (error) {
    console.error('Failed to update asset:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}