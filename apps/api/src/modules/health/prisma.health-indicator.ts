import { Injectable, Logger } from '@nestjs/common';
import { HealthIndicatorService, HealthIndicatorResult } from '@nestjs/terminus';
import { Prisma } from '@family-hub/db';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator {
  private readonly logger = new Logger(PrismaHealthIndicator.name);

  constructor(
    private readonly indicatorService: HealthIndicatorService,
    private readonly prisma: PrismaService,
  ) {}

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const indicator = this.indicatorService.check(key);

    try {
      await this.prisma.$queryRaw(Prisma.sql`SELECT 1`);
      return indicator.up();
    } catch (error) {
      const err = error as Error & { code?: string; meta?: unknown };
      this.logger.error(`Health check failed: ${err.message}`, err.stack);
      this.logger.error(`Error name: ${err.name}, constructor: ${err.constructor.name}`);
      if (err.code) this.logger.error(`Error code: ${err.code}`);
      if (err.meta) this.logger.error(`Error meta: ${JSON.stringify(err.meta)}`);
      return indicator.down({ message: err.message });
    }
  }
}
