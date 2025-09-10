import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../lib/auth';
import prisma from '../../../lib/prisma';
import { createAuditLog } from '../../../lib/auditLog';

// GET /api/assets - Fetches assets for the user's organization
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.organizationId) {
    return NextResponse.json([]); // Return empty array if no org
  }

  try {
    const assets = await prisma.aIAsset.findMany({
      where: { organizationId: session.user.organizationId }, // FILTER BY ORG
      orderBy: { dateRegistered: 'desc' },
      include: { vendor: { select: { name: true } } }
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return NextResponse.json({ error: "Unable to fetch assets." }, { status: 500 });
  }
}

// POST /api/assets - Creates an asset for the user's organization
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.organizationId) {
    return NextResponse.json({ error: 'User must belong to an organization to create an asset.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, owner, businessPurpose, riskClassification, vendorId } = body;

    const newAsset = await prisma.aIAsset.create({
      data: {
        name,
        owner,
        businessPurpose,
        riskClassification,
        organizationId: session.user.organizationId, // ADD ORG ID
        ...(vendorId && { vendor: { connect: { id: vendorId } } }),
      },
    });

    await createAuditLog('ASSET_CREATED', `Asset "${name}" was created.`, newAsset.id, session.user.id);
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error("Failed to create asset:", error);
    return NextResponse.json({ error: "Unable to create asset." }, { status: 500 });
  }
}