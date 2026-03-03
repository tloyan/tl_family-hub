import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { InternalServerErrorException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';
import { ClsServiceManager } from 'nestjs-cls';
import type { ClsService } from 'nestjs-cls';

vi.mock('nestjs-cls', () => ({
  ClsServiceManager: {
    getClsService: vi.fn(),
  },
}));

// Extract the factory function from createParamDecorator.
// Mock createParamDecorator to capture the factory and return it as-is.
let decoratorFactory: (data: unknown, ctx: ExecutionContext) => string;
vi.mock('@nestjs/common', async () => {
  const actual = await vi.importActual<typeof import('@nestjs/common')>('@nestjs/common');
  return {
    ...actual,
    createParamDecorator: vi.fn((factory: (data: unknown, ctx: ExecutionContext) => string) => {
      decoratorFactory = factory;
      return factory;
    }),
  };
});

// Import once after mocks are set up — no need to re-import in every test
beforeAll(async () => {
  await import('../current-household.decorator');
});

describe('CurrentHousehold decorator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns householdId when CLS has it set', () => {
    const mockCls = { get: vi.fn().mockReturnValue('h-123') };
    vi.mocked(ClsServiceManager.getClsService).mockReturnValue(mockCls as unknown as ClsService);

    const result = decoratorFactory(undefined, {} as ExecutionContext);

    expect(result).toBe('h-123');
  });

  it('throws InternalServerErrorException when householdId is undefined', () => {
    const mockCls = { get: vi.fn().mockReturnValue(undefined) };
    vi.mocked(ClsServiceManager.getClsService).mockReturnValue(mockCls as unknown as ClsService);

    expect(() => decoratorFactory(undefined, {} as ExecutionContext)).toThrow(
      InternalServerErrorException,
    );
  });

  it('throws InternalServerErrorException when householdId is empty string', () => {
    const mockCls = { get: vi.fn().mockReturnValue('') };
    vi.mocked(ClsServiceManager.getClsService).mockReturnValue(mockCls as unknown as ClsService);

    expect(() => decoratorFactory(undefined, {} as ExecutionContext)).toThrow(
      InternalServerErrorException,
    );
  });
});
