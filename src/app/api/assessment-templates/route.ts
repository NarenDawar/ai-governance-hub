import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import { Prisma } from '@prisma/client';

/**
 * Handles GET requests to /api/assessment-templates
 * Fetches all available assessment templates for the user's organization.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const templates = await prisma.assessmentTemplate.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      orderBy: {
        name: 'asc',
      },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to fetch assessment templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * Handles POST requests to /api/assessment-templates
 * Creates a new, empty assessment template.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Name and description are required.' }, { status: 400 });
    }

    // Define a default structure for the questions JSON
    const defaultQuestionnaire: Prisma.JsonObject = {
      title: name,
      sections: [],
    };

    const newTemplate = await prisma.assessmentTemplate.create({
      data: {
        name,
        description,
        questions: defaultQuestionnaire,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json(newTemplate, { status: 201 });
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json({ error: 'A template with this name already exists.' }, { status: 409 });
    }
    console.error('Failed to create assessment template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}