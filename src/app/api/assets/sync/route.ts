import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import prisma from '../../../../lib/prisma';
import { authOptions } from '../../auth/[...nextauth]/route';
import { createAuditLog } from '../../../../lib/auditLog';
import { ActionType, RiskLevel } from '@prisma/client';

// This is our mock data source, simulating what an API call to AWS might return.
const MOCK_DISCOVERED_ASSETS = [
  {
    discoveredId: 'arn:aws:sagemaker:us-east-1:123456789012:model/fraud-detection-v3',
    name: 'SageMaker: Fraud Detection v3',
    owner: 'Unassigned (Discovered)',
    businessPurpose: 'Automatically discovered from AWS SageMaker.'
  },
  {
    discoveredId: 'arn:aws:sagemaker:us-east-1:123456789012:model/customer-propensity-score',
    name: 'SageMaker: Customer Propensity',
    owner: 'Unassigned (Discovered)',
    businessPurpose: 'Automatically discovered from AWS SageMaker.'
  },
  // This asset already exists in our mock data, so it should be skipped.
  {
    discoveredId: 'pre-existing-id-for-churn-model',
    name: 'Customer Churn Prediction Model',
    owner: 'Marketing Analytics',
    businessPurpose: 'Predicts which customers are likely to cancel their subscriptions.'
  }
];

/**
 * Handles POST requests to /api/assets/sync
 * Simulates discovering and creating new assets from a cloud provider.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const assetsToCreate = MOCK_DISCOVERED_ASSETS.map(asset => ({
      ...asset,
      riskClassification: RiskLevel.Low, // Discovered assets default to Low risk
    }));

    // Use createMany with skipDuplicates to only insert new records
    // This relies on the `discoveredId` field being unique.
    const result = await prisma.aIAsset.createMany({
      data: assetsToCreate,
      skipDuplicates: true,
    });

    // Log the sync action using the new object-based format
    if (result.count > 0) {
      await createAuditLog(
        ActionType.AUTO_DISCOVERY_COMPLETED,
        `Auto-discovery sync completed. Found and registered ${result.count} new asset(s).`,
        '', // No specific assetId for this global action
        session.user.id
      );
    }

    return NextResponse.json({
      message: `Sync complete. ${result.count} new assets were discovered and added.`,
      newAssetCount: result.count
    }, { status: 200 });

  } catch (error) {
    console.error("Failed to sync assets:", error);
    return NextResponse.json({ error: "Unable to sync assets." }, { status: 500 });
  }
}

