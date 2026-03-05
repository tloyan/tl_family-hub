import type { PrismaClient } from '@family-hub/db';

export async function cleanDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$executeRawUnsafe(
    `TRUNCATE invitations, circles, household_members, households, session, account, verification, "user" CASCADE`,
  );
}
