import prisma from './prisma';
import { ActionType } from '@prisma/client';

// The function now requires a userId
export async function createAuditLog(
  action: ActionType, 
  details: string, 
  assetId: string,
  userId: string // The ID of the user performing the action
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        details,
        assetId,
        userId, // Store the user ID with the log entry
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

