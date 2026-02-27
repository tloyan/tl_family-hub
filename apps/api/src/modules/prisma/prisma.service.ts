import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@family-hub/db';
import { PrismaPg } from '@prisma/adapter-pg';
import { householdExtension } from '../../common/prisma/household-extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });

    const host = connectionString.split('@')[1]?.split('/')[0] ?? 'unknown';
    this.logger.log(`Adapter configured for host: ${host}`);
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  forHousehold(householdId: string): HouseholdScopedPrismaClient {
    return this.$extends(householdExtension(householdId)) as unknown as HouseholdScopedPrismaClient;
  }

  bypassHouseholdFilter() {
    return this as PrismaClient;
  }
}

/**
 * A PrismaClient with automatic householdId filtering applied to scoped models.
 * Functionally identical to PrismaClient — the extension adds implicit where/data injection,
 * not new methods.
 */
export type HouseholdScopedPrismaClient = PrismaClient;
