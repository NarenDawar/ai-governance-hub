// src/app/api/assessment-templates/[templateId]/route.ts
import { NextResponse } from 'next/server'; // No longer importing NextRequest
import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

// The second argument is a context object containing params.
// This is the correct way to type it.
export async function GET(
  request: Request, // Changed from NextRequest to Request
  { params }: { params: { templateId: string } }
) {
  const { templateId } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const template = await prisma.assessmentTemplate.findFirst({
      where: {
        id: templateId,
        organizationId: session.user.organizationId,
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error(`Failed to fetch template ${templateId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request, // Changed from NextRequest to Request
  { params }: { params: { templateId: string } }
) {
  const { templateId } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, questions } = body;

    if (!name || !description || !questions) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    
    const existingTemplate = await prisma.assessmentTemplate.findFirst({
      where: { id: templateId, organizationId: session.user.organizationId },
    });

    if (!existingTemplate) {
      return NextResponse.json({ error: 'Template not found or permission denied.' }, { status: 404 });
    }

    const updatedTemplate = await prisma.assessmentTemplate.update({
      where: { id: templateId },
      data: { name, description, questions },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error(`Failed to update template ${templateId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request, // Changed from NextRequest to Request
  { params }: { params: { templateId: string } }
) {
  const { templateId } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
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
    console.error(`Failed to delete template ${templateId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}