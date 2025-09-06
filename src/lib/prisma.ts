import { PrismaClient } from '@prisma/client';

// This helps prevent initializing too many Prisma Client instances in development
// due to Next.js hot-reloading.
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;
