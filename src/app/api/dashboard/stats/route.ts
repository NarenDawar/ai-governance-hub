import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { RiskLevel, AssetStatus, AssessmentStatus } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

/**
 * Handles GET requests to /api/dashboard/stats
 * Fetches aggregated statistics for the main dashboard.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // --- Asset Statistics ---

    // Count assets by risk level
    const assetsByRisk = await prisma.aIAsset.groupBy({
      by: ['riskClassification'],
      where: {
        organizationId: session.user.organizationId,
      },
      _count: {
        riskClassification: true,
      },
    });

    // Count assets by status
    const assetsByStatus = await prisma.aIAsset.groupBy({
        by: ['status'],
        where: {
          organizationId: session.user.organizationId,
        },
        _count: {
            status: true,
        },
    });

    const totalAssets = await prisma.aIAsset.count({
      where: {
        organizationId: session.user.organizationId,
      },
    });

    // --- Assessment Statistics ---

    // Count assessments by status
    const assessmentsByStatus = await prisma.assessment.groupBy({
        by: ['status'],
        where: {
          asset: {
            organizationId: session.user.organizationId,
          },
        },
        _count: {
            status: true,
        }
    });

    const totalAssessments = await prisma.assessment.count({
      where: {
        asset: {
          organizationId: session.user.organizationId,
        },
      },
    });
    
    // --- Format Data for Frontend ---

    const riskCounts = {
        [RiskLevel.Low]: 0,
        [RiskLevel.Medium]: 0,
        [RiskLevel.High]: 0,
        [RiskLevel.Severe]: 0,
        ...Object.fromEntries(assetsByRisk.map(group => [group.riskClassification, group._count.riskClassification]))
    };

    const assetStatusCounts = {
        [AssetStatus.Proposed]: 0,
        [AssetStatus.InReview]: 0,
        [AssetStatus.Active]: 0,
        [AssetStatus.Retired]: 0,
        ...Object.fromEntries(assetsByStatus.map(group => [group.status, group._count.status]))
    };

    const assessmentStatusCounts = {
        [AssessmentStatus.NotStarted]: 0,
        [AssessmentStatus.InProgress]: 0,
        [AssessmentStatus.Completed]: 0,
        [AssessmentStatus.Archived]: 0,
        ...Object.fromEntries(assessmentsByStatus.map(group => [group.status, group._count.status]))
    };


    const stats = {
      totalAssets,
      totalAssessments,
      riskCounts,
      assetStatusCounts,
      assessmentStatusCounts
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
