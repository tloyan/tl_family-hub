import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockExtends = vi.fn();
const mockFindMany = vi.fn();

vi.mock('@family-hub/db', () => {
  class MockPrismaClient {
    $connect = mockConnect;
    $disconnect = mockDisconnect;
    $extends = mockExtends;
    household = { findMany: mockFindMany };
  }
  return { PrismaClient: MockPrismaClient };
});

vi.mock('@prisma/adapter-pg', () => {
  class MockPrismaPg {}
  return { PrismaPg: MockPrismaPg };
});

vi.mock('../../../common/prisma/household-extension', () => ({
  householdExtension: vi.fn((getHouseholdId: () => string | undefined) => ({
    name: 'household-extension',
    getHouseholdId,
  })),
}));

import { PrismaService } from '../prisma.service';
import type { ClsService } from 'nestjs-cls';
import type { AppClsStore } from '../../../common/cls/cls.store';
import { householdExtension } from '../../../common/prisma/household-extension';

describe('PrismaService', () => {
  let service: PrismaService;
  const mockCls = {
    get: vi.fn(),
  } as unknown as ClsService<AppClsStore>;

  const scopedFindMany = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockExtends.mockReturnValue({ household: { findMany: scopedFindMany } });
    process.env['DATABASE_URL'] = 'postgresql://user:pass@localhost:5432/test';
    service = new PrismaService(mockCls);
  });

  describe('constructor', () => {
    it('throws when DATABASE_URL is not set', () => {
      delete process.env['DATABASE_URL'];
      expect(() => new PrismaService(mockCls)).toThrow(
        'DATABASE_URL environment variable is required',
      );
    });
  });

  describe('bypassHouseholdFilter', () => {
    it('returns the base (unscoped) PrismaClient', () => {
      const base = service.bypassHouseholdFilter();
      expect(base).toBeDefined();
      expect(base.$connect).toBeDefined();
      expect(base.$disconnect).toBeDefined();
    });
  });

  describe('forHousehold', () => {
    it('calls baseClient.$extends with householdExtension', () => {
      const base = service.bypassHouseholdFilter();
      mockExtends.mockReturnValue({ extended: true });

      service.forHousehold('h-123');

      expect(base.$extends).toHaveBeenCalled();
      expect(householdExtension).toHaveBeenCalledWith(expect.any(Function));

      // Verify the getter returns the provided householdId
      const getterFn = vi.mocked(householdExtension).mock.calls.at(-1)?.[0] as () => string;
      expect(getterFn()).toBe('h-123');
    });
  });

  describe('lifecycle', () => {
    it('onModuleInit calls $connect', async () => {
      await service.onModuleInit();
      expect(mockConnect).toHaveBeenCalled();
    });

    it('onModuleDestroy calls $disconnect', async () => {
      await service.onModuleDestroy();
      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('proxy behavior', () => {
    it('returns own methods directly', () => {
      expect(typeof service.bypassHouseholdFilter).toBe('function');
      expect(typeof service.forHousehold).toBe('function');
      expect(typeof service.onModuleInit).toBe('function');
      expect(typeof service.onModuleDestroy).toBe('function');
    });

    it('delegates model access to scopedClient, not baseClient', () => {
      // service.household is resolved via the Proxy to scopedClient
      // scopedClient is the result of baseClient.$extends(), which we mock
      // so service.household.findMany should be scopedFindMany, not mockFindMany
      const household = (service as unknown as { household: { findMany: unknown } }).household;
      expect(household.findMany).toBe(scopedFindMany);
      expect(household.findMany).not.toBe(mockFindMany);
    });
  });
});
