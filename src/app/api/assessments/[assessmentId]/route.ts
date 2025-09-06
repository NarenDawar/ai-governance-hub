import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { AssessmentStatus } from '@prisma/client';

/**
 * Handles GET requests to /api/assessments/[assessmentId]
 * Fetches a single assessment by its ID.
 */
export async function GET(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { id: params.assessmentId },
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
 * Updates an existing assessment (e.g., saves question answers).
 */
export async function PATCH(
  request: Request,
  { params }: { params: { assessmentId: string } }
) {
  try {
    const body = await request.json();
    const { questions, status } = body;

    // Basic validation
    if (!questions && !status) {
      return NextResponse.json({ error: 'No update data provided.' }, { status: 400 });
    }
    
    // Validate status if it's provided
    if (status && !Object.values(AssessmentStatus).includes(status)) {
        return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    const updatedAssessment = await prisma.assessment.update({
      where: { id: params.assessmentId },
      data: {
        // Only update fields that are provided in the request
        ...(questions && { questions }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updatedAssessment, { status: 200 });
  } catch (error) {
    console.error('Failed to update assessment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
