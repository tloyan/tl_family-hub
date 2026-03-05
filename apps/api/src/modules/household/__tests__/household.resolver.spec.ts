import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HouseholdResolver } from '../household.resolver';
import { HouseholdService } from '../household.service';
import type { PubSubService } from '../../../common/pubsub';
import { HouseholdAccessDeniedException } from '../../../common/exceptions/household.exception';
import type { CreateHouseholdInput, UpdateHouseholdInput } from '../household.dto';
import type { UserSession } from '@thallesp/nestjs-better-auth';

const mockService = {
  create: vi.fn(),
  findMyHousehold: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  findById: vi.fn(),
};

const mockPubSub = {
  publish: vi.fn().mockResolvedValue(undefined),
  asyncIterableIterator: vi.fn(),
};

describe('HouseholdResolver', () => {
  let resolver: HouseholdResolver;

  const session = { user: { id: 'user-1' } } as UserSession;

  beforeEach(() => {
    vi.clearAllMocks();
    resolver = new HouseholdResolver(
      mockService as unknown as HouseholdService,
      mockPubSub as unknown as PubSubService,
    );
  });

  describe('createHousehold', () => {
    it('calls service.create with user id and input', async () => {
      const input: CreateHouseholdInput = { name: 'My Family' };
      const expected = { id: 'h-1', name: 'My Family' };
      mockService.create.mockResolvedValue(expected);

      const result = await resolver.createHousehold(session, input);

      expect(mockService.create).toHaveBeenCalledWith('user-1', input);
      expect(result).toBe(expected);
    });
  });

  describe('myHousehold', () => {
    it('calls service.findMyHousehold with user id', async () => {
      const expected = { id: 'h-1', name: 'Test' };
      mockService.findMyHousehold.mockResolvedValue(expected);

      const result = await resolver.myHousehold(session);

      expect(mockService.findMyHousehold).toHaveBeenCalledWith('user-1');
      expect(result).toBe(expected);
    });
  });

  describe('updateHousehold', () => {
    it('calls service.update with user id and input', async () => {
      const input: UpdateHouseholdInput = { name: 'Updated' };
      const expected = { id: 'h-1', name: 'Updated' };
      mockService.update.mockResolvedValue(expected);

      const result = await resolver.updateHousehold(session, input);

      expect(mockService.update).toHaveBeenCalledWith('user-1', input);
      expect(result).toBe(expected);
    });
  });

  describe('deleteHousehold', () => {
    it('calls service.delete with user id', async () => {
      mockService.delete.mockResolvedValue(true);

      const result = await resolver.deleteHousehold(session);

      expect(mockService.delete).toHaveBeenCalledWith('user-1');
      expect(result).toBe(true);
    });
  });

  describe('household', () => {
    it('throws HouseholdAccessDeniedException when id !== householdId', async () => {
      await expect(resolver.household('h-1', 'h-other')).rejects.toThrow(
        HouseholdAccessDeniedException,
      );
      expect(mockService.findById).not.toHaveBeenCalled();
    });

    it('calls service.findById when id === householdId', async () => {
      const expected = { id: 'h-1', name: 'Test' };
      mockService.findById.mockResolvedValue(expected);

      const result = await resolver.household('h-1', 'h-1');

      expect(mockService.findById).toHaveBeenCalledWith('h-1');
      expect(result).toBe(expected);
    });
  });
});
