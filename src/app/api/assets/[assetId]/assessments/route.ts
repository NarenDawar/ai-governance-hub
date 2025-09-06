import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { Prisma } from '@prisma/client';

// This is a default questionnaire structure based on the NIST AI RMF.
// We'll use this as a template when creating a new assessment.
const nistQuestionnaire: Prisma.JsonObject = {
  title: "NIST AI RMF - Core Assessment",
  sections: [
    {
      id: "govern",
      title: "Govern",
      questions: [
        { id: "g1", text: "Is there a documented process for AI risk management within the organization?", answer: "", completed: false },
        { id: "g2", text: "Are the roles and responsibilities for AI governance, risk management, and compliance clearly defined and assigned?", answer: "", completed: false },
        { id: "g3", text: "Is there a process for engaging with relevant stakeholders (e.g., legal, ethics, business units) throughout the AI lifecycle?", answer: "", completed: false },
      ]
    },
    {
      id: "map",
      title: "Map",
      questions: [
        { id: "m1", text: "Have the specific contexts, purposes, and potential beneficial and harmful impacts of the AI system been established and documented?", answer: "", completed: false },
        { id: "m2", text: "Has the data used to train and test the model been cataloged, including its sources, characteristics, and limitations?", answer: "", completed: false },
      ]
    },
     {
      id: "measure",
      title: "Measure",
      questions: [
        { id: "me1", text: "Are there established metrics and methods for evaluating the AI system's performance, fairness, and robustness?", answer: "", completed: false },
        { id: "me2", text: "Is there a process for testing the AI system against its intended requirements in a controlled environment?", answer: "", completed: false },
      ]
    }
  ]
};


/**
 * Handles GET requests to /api/assets/[assetId]/assessments
 * Fetches all assessments for a specific AI asset.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const { assetId } = await params;
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
 * Creates a new assessment for a specific AI asset.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ assetId: string }> }
) {
  try {
    const body = await request.json();
    const { assetId } = await params;
    
    // For now, we'll use a fixed name for the assessment
    // In the future, we might let the user choose a template
    const assessmentName = "NIST AI RMF - Core Assessment";

    const newAssessment = await prisma.assessment.create({
      data: {
        name: assessmentName,
        assetId: assetId,
        questions: nistQuestionnaire, // Store the default questionnaire
      },
    });

    return NextResponse.json(newAssessment, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Failed to create assessment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
