import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@family-hub/db';
import { PrismaPg } from '@prisma/adapter-pg';
import { ClsService } from 'nestjs-cls';
import type { AppClsStore } from '../../common/cls/cls.store';
import { householdExtension } from '../../common/prisma/household-extension';

/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PrismaService extends PrismaClient {}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  /* eslint-enable @typescript-eslint/no-unsafe-declaration-merging */
  private readonly logger = new Logger(PrismaService.name);
  private readonly baseClient: PrismaClient;
  private readonly scopedClient: PrismaClient;

  constructor(private readonly cls: ClsService<AppClsStore>) {
    const connectionString = process.env['DATABASE_URL'];
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    const adapter = new PrismaPg({ connectionString });
    this.baseClient = new PrismaClient({ adapter });

    this.scopedClient = this.baseClient.$extends(
      householdExtension(() => this.cls.get('householdId')),
    ) as unknown as PrismaClient;

    const host = connectionString.split('@')[1]?.split('/')[0] ?? 'unknown';
    this.logger.log(`Adapter configured for host: ${host}`);

    // Return a Proxy that delegates PrismaClient model/method access to scopedClient
    return new Proxy(this, {
      get(target, prop, receiver) {
        // PrismaService own properties and prototype methods
        if (prop in target || typeof prop === 'symbol') {
          return Reflect.get(target, prop, receiver);
        }
        // Delegate PrismaClient model access ($transaction, .household, etc.) to scopedClient
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return Reflect.get(target.scopedClient, prop, target.scopedClient);
      },
    });
  }

  async onModuleInit() {
    await this.baseClient.$connect();
    this.logger.log('Database connection established');
  }

  async onModuleDestroy() {
    await this.baseClient.$disconnect();
  }

  /**
   * Returns the raw PrismaClient without household scoping.
   * Use for auth tables, system operations, or guard membership checks.
   */
  bypassHouseholdFilter(): PrismaClient {
    return this.baseClient;
  }

  /**
   * Returns a PrismaClient scoped to a specific household.
   * Use for background jobs or operations outside a request context.
   */
  forHousehold(householdId: string): PrismaClient {
    return this.baseClient.$extends(
      householdExtension(() => householdId),
    ) as unknown as PrismaClient;
  }
}
