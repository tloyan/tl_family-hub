import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import type { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { ClsService } from 'nestjs-cls';
import { HouseholdGuard } from '../household.guard';
import {
  HouseholdAccessDeniedException,
  HouseholdHeaderMissingException,
} from '../../exceptions/household.exception';
import type { PrismaService } from '../../../modules/prisma/prisma.service';
import type { AppClsStore } from '../../cls/cls.store';

vi.mock('@nestjs/graphql', () => ({
  GqlExecutionContext: {
    create: vi.fn(),
  },
}));

describe('HouseholdGuard', () => {
  let guard: HouseholdGuard;
  const mockCls = { set: vi.fn() };
  const mockFindFirst = vi.fn();
  const mockBypassClient = {
    householdMember: { findFirst: mockFindFirst },
  };
  const mockPrisma = {
    bypassHouseholdFilter: vi.fn(() => mockBypassClient),
  };
  const mockExecutionContext = {} as ExecutionContext;

  function setupGqlContext(headers: Record<string, string | undefined>, userId: string) {
    const mockGqlCtx = {
      getContext: vi.fn(() => ({
        req: {
          session: { user: { id: userId } },
          headers,
        },
      })),
    };
    vi.mocked(GqlExecutionContext.create as Mock).mockReturnValue(mockGqlCtx);
  }

  beforeEach(() => {
    vi.clearAllMocks();
    guard = new HouseholdGuard(
      mockCls as unknown as ClsService<AppClsStore>,
      mockPrisma as unknown as PrismaService,
    );
  });

  it('throws HouseholdHeaderMissingException when x-household-id header absent', async () => {
    setupGqlContext({}, 'user-1');

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      HouseholdHeaderMissingException,
    );
  });

  it('throws HouseholdAccessDeniedException when user is not a member', async () => {
    setupGqlContext({ 'x-household-id': 'hh-1' }, 'user-1');
    mockFindFirst.mockResolvedValue(null);

    await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(
      HouseholdAccessDeniedException,
    );
  });

  it('returns true and sets householdId in CLS when user is valid member', async () => {
    setupGqlContext({ 'x-household-id': 'hh-1' }, 'user-1');
    mockFindFirst.mockResolvedValue({ householdId: 'hh-1' });

    const result = await guard.canActivate(mockExecutionContext);

    expect(result).toBe(true);
    expect(mockCls.set).toHaveBeenCalledWith('householdId', 'hh-1');
  });

  it('uses bypassHouseholdFilter() for membership query', async () => {
    setupGqlContext({ 'x-household-id': 'hh-1' }, 'user-1');
    mockFindFirst.mockResolvedValue({ householdId: 'hh-1' });

    await guard.canActivate(mockExecutionContext);

    expect(mockPrisma.bypassHouseholdFilter).toHaveBeenCalled();
  });

  it('queries with correct { userId, householdId } filter', async () => {
    setupGqlContext({ 'x-household-id': 'hh-1' }, 'user-1');
    mockFindFirst.mockResolvedValue({ householdId: 'hh-1' });

    await guard.canActivate(mockExecutionContext);

    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', householdId: 'hh-1' },
      select: { householdId: true },
    });
  });
});
