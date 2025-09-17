import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../../lib/auth';

type RouteContext = {
  params: {
    templateId: string;
  };
};

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { templateId } = params;
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
    console.error(`Failed to fetch template ${params.templateId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { templateId } = params;
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
    console.error(`Failed to update template ${params.templateId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { templateId } = params;
    
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