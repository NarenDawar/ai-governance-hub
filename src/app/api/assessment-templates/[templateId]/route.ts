import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

/**
 * Handles GET requests to /api/assessment-templates/[templateId]
 * Fetches a single assessment template by its ID.
 */
export async function GET(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { templateId } = params;
    const template = await prisma.assessmentTemplate.findFirst({
      where: {
        id: templateId,
        organizationId: session.user.organizationId, // Ensure it belongs to the user's org
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error(`Failed to fetch template ${params.templateId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Handles PUT requests to /api/assessment-templates/[templateId]
 * Updates an entire assessment template.
 */
export async function PUT(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { templateId } = params;
    const body = await request.json();
    const { name, description, questions } = body;

    // Basic validation
    if (!name || !description || !questions) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    
    // Ensure the template belongs to the user's organization before updating
    const existingTemplate = await prisma.assessmentTemplate.findFirst({
      where: { id: templateId, organizationId: session.user.organizationId },
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found or permission denied.' }, { status: 404 });
    }

    const updatedTemplate = await prisma.assessmentTemplate.update({
      where: { id: templateId },
      data: {
        name,
        description,
        questions,
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error(`Failed to update template ${params.templateId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to /api/assessment-templates/[templateId]
 * Deletes an assessment template.
 */
export async function DELETE(
  request: Request,
  { params }: { params: { templateId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { templateId } = params;
    
    // Ensure the template belongs to the user's organization before deleting
    const templateToDelete = await prisma.assessmentTemplate.findFirst({
      where: { id: templateId, organizationId: session.user.organizationId },
    });

    if (!templateToDelete) {
      return NextResponse.json({ error: 'Template not found or permission denied.' }, { status: 404 });
    }

    await prisma.assessmentTemplate.delete({
      where: { id: templateId },
    });

    return NextResponse.json({ message: 'Template deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error(`Failed to delete template ${params.templateId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}