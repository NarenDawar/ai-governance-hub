import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { AssessmentStatus, ActionType } from '@prisma/client';
import { createAuditLog } from '../../../../lib/auditLog';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

/**
 * Handles GET requests to /api/assessments/[assessmentId]
 * Fetches a single assessment by its ID.
 */
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

/**
 * Handles PATCH requests to /api/assessments/[assessmentId]
 * Updates an existing assessment and logs relevant events.
 */
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
    const { questions, status } = body;
    const { assessmentId } = await params;

    // Fetch the original assessment to compare status changes and verify organization access
    const originalAssessment = await prisma.assessment.findFirst({ 
      where: { 
        id: assessmentId,
        asset: {
          organizationId: session.user.organizationId,
        },
      },
    });
    if (!originalAssessment) {
        return NextResponse.json({ error: 'Assessment not found.' }, { status: 404 });
    }

    const updatedAssessment = await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        ...(questions && { questions }),
        ...(status && { status }),
      },
    });

    // --- Create an audit log if the status has changed ---
    if (status && status !== originalAssessment.status) {
      // Determine the correct action type based on the new status
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
    // ---------------------------------------------------

    return NextResponse.json(updatedAssessment, { status: 200 });
  } catch (error) {
    console.error('Failed to update assessment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

