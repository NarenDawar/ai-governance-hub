import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { RiskLevel } from '@prisma/client';

/**
 * Handles GET requests to /api/assets
 * Fetches all AI assets from the database.
 */
export async function GET() {
  try {
    const assets = await prisma.aIAsset.findMany({
      orderBy: {
        dateRegistered: 'desc',
      },
      // Include the related vendor's name to display in the UI if needed
      include: {
        vendor: {
          select: {
            name: true,
          }
        }
      }
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return NextResponse.json({ error: "Unable to fetch assets." }, { status: 500 });
  }
}

/**
 * Handles POST requests to /api/assets
 * Creates a new AI asset in the database.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Destructure all expected fields, including the new optional vendorId
    const { name, owner, businessPurpose, riskClassification, vendorId } = body;

    if (!name || !owner || !businessPurpose || !riskClassification) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    
    const riskLevel: RiskLevel = riskClassification;

    const newAsset = await prisma.aIAsset.create({
      data: {
        name,
        owner,
        businessPurpose,
        riskClassification: riskLevel,
        // Conditionally connect to a vendor if a vendorId was provided
        ...(vendorId && {
          vendor: {
            connect: { id: vendorId },
          },
        }),
      },
    });
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error("Failed to create asset:", error);
    return NextResponse.json({ error: "Unable to create asset." }, { status: 500 });
  }
}

