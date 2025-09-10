import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../../lib/auth';

/**
 * Handles GET requests to /api/assets/[assetId]/assessments
 * Fetches all assessments for a specific AI asset.
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

    const assessments = await prisma.assessment.findMany({
      where: {
        assetId: assetId,
      },
      orderBy: {
        createdAt: 'desc',
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
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { templateId } = await request.json();
    const { assetId } = await params;

    if (!templateId) {
      return NextResponse.json({ error: 'templateId is required' }, { status: 400 });
    }

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

    const template = await prisma.assessmentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      return NextResponse.json({ error: 'Assessment template not found' }, { status: 404 });
    }

    const newAssessment = await prisma.assessment.create({
      data: {
        name: template.name,
        assetId: assetId,
        questions: template.questions as Prisma.JsonObject,
      },
    });

    return NextResponse.json(newAssessment, { status: 201 });
  } catch (error) {
    console.error('Failed to create assessment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}