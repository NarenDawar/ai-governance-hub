import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

/**
 * Handles GET requests to /api/assessment-templates
 * Fetches all available assessment templates.
 */
export async function GET() {
  try {
    const templates = await prisma.assessmentTemplate.findMany({
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