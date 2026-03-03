import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HealthController } from '../health.controller';
import type {
  HealthCheckService,
  HealthCheckResult,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import type { PrismaHealthIndicator } from '../prisma.health-indicator';

describe('HealthController', () => {
  let controller: HealthController;
  const mockHealthCheckService = {
    check: vi.fn(),
  };
  const mockPrismaHealthIndicator = {
    isHealthy: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new HealthController(
      mockHealthCheckService as unknown as HealthCheckService,
      mockPrismaHealthIndicator as unknown as PrismaHealthIndicator,
    );
  });

  it('calls health.check with the db indicator function', async () => {
    const expected: HealthCheckResult = {
      status: 'ok',
      details: { database: { status: 'up' } },
    };
    mockHealthCheckService.check.mockResolvedValue(expected);

    const result = await controller.check();

    expect(result).toBe(expected);
    expect(mockHealthCheckService.check).toHaveBeenCalledWith([expect.any(Function)]);
  });

  it('passes a function that calls db.isHealthy("database")', async () => {
    mockHealthCheckService.check.mockImplementation(
      async (indicators: Array<() => Promise<HealthIndicatorResult>>) => {
        const first = indicators[0];
        if (first) await first();
        return { status: 'ok', details: {} };
      },
    );

    await controller.check();

    expect(mockPrismaHealthIndicator.isHealthy).toHaveBeenCalledWith('database');
  });
});
