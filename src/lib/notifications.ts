import prisma from './prisma';
import { Role } from '@prisma/client';

interface NotificationData {
  message: string;
  userId: string;
  assetId?: string;
}

/**
 * Creates a single notification for a specific user.
 */
export async function createNotification(data: NotificationData) {
  try {
    await prisma.notification.create({
      data: {
        message: data.message,
        userId: data.userId,
        assetId: data.assetId,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

/**
 * Creates notifications for all admins within a specific organization.
 */
export async function createAdminNotification(organizationId: string, message: string, assetId?: string) {
  try {
    // Find all admin users in the organization
    const admins = await prisma.user.findMany({
      where: {
        organizationId: organizationId,
        role: Role.ADMIN,
      },
    });

    // Create a notification for each admin
    const notificationsToCreate = admins.map(admin => ({
      message,
      userId: admin.id,
      assetId,
    }));

    await prisma.notification.createMany({
      data: notificationsToCreate,
    });

  } catch (error) {
    console.error('Failed to create admin notifications:', error);
  }
}