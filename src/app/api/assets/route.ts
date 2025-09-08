import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth'; // Corrected import path
import prisma from '../../../lib/prisma';
import { RiskLevel } from '@prisma/client';
import { createAuditLog } from '../../../lib/auditLog';

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
  // Get the current user's session
  const session = await getServerSession(authOptions);
  // If no session or user ID, deny access
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();
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
        ...(vendorId && {
          vendor: {
            connect: { id: vendorId },
          },
        }),
      },
    });

    // Create an audit log entry with the authenticated user's ID
    await createAuditLog(
      'ASSET_CREATED',
      `Asset "${name}" was created.`,
      newAsset.id,
      session.user.id
    );

    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error("Failed to create asset:", error);
    return NextResponse.json({ error: "Unable to create asset." }, { status: 500 });
  }
}

