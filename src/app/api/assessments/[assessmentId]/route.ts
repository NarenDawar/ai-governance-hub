import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { AssessmentStatus, ActionType, RiskLevel } from '@prisma/client';
import { createAuditLog } from '../../../../lib/auditLog';
import { createAdminNotification } from '../../../../lib/notifications'; // Import the new function
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

// GET function remains unchanged

export async function GET(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { assessmentId } = await params;
    const assessment = await prisma.assessment.findFirst({
      where: { 
        id: assessmentId,
        asset: {
          organizationId: session.user.organizationId,
        },
      },
    });

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }
    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Failed to fetch assessment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH function is updated to send notifications
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ assessmentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { questions, status, calculatedRiskScore } = body;
    const { assessmentId } = await params;

    const originalAssessment = await prisma.assessment.findFirst({ 
      where: { 
        id: assessmentId,
        asset: {
          organizationId: session.user.organizationId,
        },
      },
      include: {
        asset: true, // Include the asset to get its name
      }
    });
    if (!originalAssessment) {
        return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });
    }

    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        ...(questions && { questions }),
        ...(status && { status }),
        ...(calculatedRiskScore !== undefined && { calculatedRiskScore }),
      },
    });

    if (status && status !== originalAssessment.status) {
      const action = status === AssessmentStatus.Completed 
        ? ActionType.ASSESSMENT_COMPLETED 
        : ActionType.ASSESSMENT_UPDATED;
      
      await createAuditLog(
        action, 
        `Assessment status for "${updatedAssessment.name}" changed to ${status}.`,
        updatedAssessment.assetId,
        session.user.id
      );
    }
    
    if (status === AssessmentStatus.Completed && calculatedRiskScore !== undefined) {
      let newRiskLevel;
      if (calculatedRiskScore >= 75) newRiskLevel = RiskLevel.Severe;
      else if (calculatedRiskScore >= 50) newRiskLevel = RiskLevel.High;
      else if (calculatedRiskScore >= 25) newRiskLevel = RiskLevel.Medium;
      else newRiskLevel = RiskLevel.Low;

      // Only update and notify if the risk level has actually changed
      if (newRiskLevel !== originalAssessment.asset.riskClassification) {
        await prisma.aIAsset.update({
          where: { id: updatedAssessment.assetId },
          data: { riskClassification: newRiskLevel },
        });

        const auditDetails = `Asset risk level automatically updated to ${newRiskLevel} based on completed assessment score of ${calculatedRiskScore}.`;
        await createAuditLog('ASSET_UPDATED', auditDetails, updatedAssessment.assetId, session.user.id);
        
        // --- CREATE NOTIFICATION ---
        const notificationMessage = `Risk level for "${originalAssessment.asset.name}" has changed to ${newRiskLevel}.`;
        await createAdminNotification(session.user.organizationId, notificationMessage, updatedAssessment.assetId);
      }
    }

    return NextResponse.json(updatedAssessment, { status: 200 });
  } catch (error) {
    console.error('Failed to update assessment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}