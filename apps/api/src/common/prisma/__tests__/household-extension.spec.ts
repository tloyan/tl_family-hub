import { describe, it, expect, vi, beforeEach } from 'vitest';

type AllOperationsHandler = (params: {
  model: string;
  operation: string;
  args: Record<string, unknown>;
  query: (args: Record<string, unknown>) => unknown;
}) => Promise<unknown>;

let capturedHandler: AllOperationsHandler;

vi.mock('@family-hub/db', () => ({
  Prisma: {
    defineExtension: vi.fn((cb: (client: unknown) => unknown) => {
      const fakeClient = {
        $extends(config: { query: { $allModels: { $allOperations: AllOperationsHandler } } }) {
          capturedHandler = config.query.$allModels.$allOperations;
          return fakeClient;
        },
      };
      cb(fakeClient);
    }),
  },
}));

import { householdExtension } from '../household-extension';

describe('householdExtension', () => {
  let getHouseholdId: () => string | undefined;
  let query: (args: Record<string, unknown>) => unknown;

  beforeEach(() => {
    vi.clearAllMocks();
    query = vi.fn((args: unknown) => args) as (args: Record<string, unknown>) => unknown;
    getHouseholdId = vi.fn(() => 'hh-1') as unknown as () => string | undefined;
    householdExtension(getHouseholdId);
  });

  describe('scoped models — WHERE injection', () => {
    const filterableOperations = [
      'findMany',
      'findFirst',
      'findFirstOrThrow',
      'findUnique',
      'findUniqueOrThrow',
      'update',
      'updateMany',
      'delete',
      'deleteMany',
      'count',
      'aggregate',
      'groupBy',
    ];

    for (const model of ['HouseholdMember', 'Circle']) {
      for (const operation of filterableOperations) {
        it(`injects householdId in WHERE for ${model}.${operation}`, async () => {
          const args: Record<string, unknown> = { where: { id: '123' } };

          await capturedHandler({ model, operation, args, query });

          expect(args.where).toEqual({ id: '123', householdId: 'hh-1' });
          expect(query).toHaveBeenCalledWith(args);
        });
      }
    }

    it('merges with existing WHERE conditions', async () => {
      const args: Record<string, unknown> = { where: { role: 'OWNER', id: 'abc' } };

      await capturedHandler({ model: 'HouseholdMember', operation: 'findMany', args, query });

      expect(args.where).toEqual({ role: 'OWNER', id: 'abc', householdId: 'hh-1' });
    });

    it('creates WHERE when args.where is undefined', async () => {
      const args: Record<string, unknown> = {};

      await capturedHandler({ model: 'HouseholdMember', operation: 'findMany', args, query });

      expect(args.where).toEqual({ householdId: 'hh-1' });
    });
  });

  describe('scoped models — CREATE injection', () => {
    it('injects householdId in data for create', async () => {
      const args: Record<string, unknown> = { data: { role: 'OWNER' } };

      await capturedHandler({ model: 'HouseholdMember', operation: 'create', args, query });

      expect(args.data).toEqual({ role: 'OWNER', householdId: 'hh-1' });
    });

    it('injects householdId in each item for createMany (array data)', async () => {
      const args: Record<string, unknown> = {
        data: [{ role: 'OWNER' }, { role: 'ADULT' }],
      };

      await capturedHandler({ model: 'HouseholdMember', operation: 'createMany', args, query });

      expect(args.data).toEqual([
        { role: 'OWNER', householdId: 'hh-1' },
        { role: 'ADULT', householdId: 'hh-1' },
      ]);
    });

    it('injects householdId in createMany (single object data)', async () => {
      const args: Record<string, unknown> = { data: { type: 'PERSONAL' } };

      await capturedHandler({ model: 'Circle', operation: 'createMany', args, query });

      expect(args.data).toEqual({ type: 'PERSONAL', householdId: 'hh-1' });
    });

    it('injects householdId in both where and create for upsert', async () => {
      const args: Record<string, unknown> = {
        where: { id: '123' },
        create: { role: 'OWNER' },
        update: { role: 'ADMIN' },
      };

      await capturedHandler({ model: 'HouseholdMember', operation: 'upsert', args, query });

      expect(args.where).toEqual({ id: '123', householdId: 'hh-1' });
      expect(args.create).toEqual({ role: 'OWNER', householdId: 'hh-1' });
    });
  });

  describe('non-scoped models', () => {
    it('passes through Household model unchanged', async () => {
      const args: Record<string, unknown> = { where: { id: '123' } };

      await capturedHandler({ model: 'Household', operation: 'findMany', args, query });

      expect(args.where).toEqual({ id: '123' });
      expect(query).toHaveBeenCalledWith(args);
    });

    it('passes through User model unchanged', async () => {
      const args: Record<string, unknown> = { where: { email: 'test@example.com' } };

      await capturedHandler({ model: 'User', operation: 'findFirst', args, query });

      expect(args.where).toEqual({ email: 'test@example.com' });
    });
  });

  describe('no context', () => {
    it('passes through when getHouseholdId() returns undefined', async () => {
      getHouseholdId = vi.fn(() => undefined) as unknown as () => string | undefined;
      householdExtension(getHouseholdId);

      const args: Record<string, unknown> = { where: { id: '123' } };

      await capturedHandler({ model: 'HouseholdMember', operation: 'findMany', args, query });

      expect(args.where).toEqual({ id: '123' });
    });

    it('always calls query(args) and propagates its return value', async () => {
      const returnValue = { id: '123', name: 'Test' };
      query = vi.fn(() => returnValue) as (args: Record<string, unknown>) => unknown;

      const result = await capturedHandler({
        model: 'HouseholdMember',
        operation: 'findMany',
        args: {},
        query,
      });

      expect(query).toHaveBeenCalled();
      expect(result).toEqual(returnValue);
    });
  });
});
