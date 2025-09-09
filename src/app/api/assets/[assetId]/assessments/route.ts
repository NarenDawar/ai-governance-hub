import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

/**
 * Handles GET requests to /api/assets/[assetId]/assessments
 * Fetches all assessments for a specific AI asset.
 */
export async function GET(
  request: Request,
  { params }: { params: { assetId: string } }
) {
  try {
    const { assetId } = params;
    const assessments = await prisma.assessment.findMany({
      where: {
        assetId: assetId,
      },
      orderBy: {
        createdAt: 'desc', // Show the newest assessments first
      },
    });
    return NextResponse.json(assessments);
  } catch (error) {
    console.error('Failed to fetch assessments:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Handles POST requests to /api/assets/[assetId]/assessments
 * Creates a new assessment for a specific AI asset based on a template.
 */
export async function POST(
  request: Request,
  { params }: { params: { assetId: string } }
) {
  try {
    const { templateId } = await request.json();
    const { assetId } = params;

    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
    }

    // 1. Fetch the chosen template from the database
    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ error: 'Assessment template not found' }, { status: 404 });
    }

    const newAssessment = await prisma.assessment.create({
      data: {
        // 2. Use the template's name and questions for the new assessment
        name: template.name,
        assetId: assetId,
        questions: template.questions as any, // @ts-ignore
      },
    });

    return NextResponse.json(newAssessment, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Failed to create assessment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}