import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircleType } from '@family-hub/shared';
import { HouseholdService } from '../household.service';
import { HouseholdRepository } from '../household.repository';
import type { PubSubService } from '../../../common/pubsub';
import {
  HouseholdAlreadyExistsException,
  HouseholdNameInvalidException,
  HouseholdNotFoundException,
  NotHouseholdOwnerException,
} from '../../../common/exceptions/household.exception';

vi.mock('uuid', () => ({
  v7: vi.fn(() => 'test-uuid-v7'),
}));

function createMockHousehold(overrides: Record<string, unknown> = {}) {
  return {
    id: 'hh-1',
    name: 'Test Household',
    createdAt: new Date('2024-01-01'),
    members: [
      {
        id: 'm-1',
        role: 'OWNER',
        color: '#FF6B6B',
        joinedAt: new Date('2024-01-01'),
        userId: 'user-1',
        user: { name: 'Test User', email: 'test@example.com' },
      },
    ],
    ...overrides,
  };
}

describe('HouseholdService', () => {
  let service: HouseholdService;
  const mockRepo = {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    countMembersByHouseholdId: vi.fn(),
  };
  const mockPubSub = {
    publish: vi.fn().mockResolvedValue(undefined),
    asyncIterableIterator: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    service = new HouseholdService(
      mockRepo as unknown as HouseholdRepository,
      mockPubSub as unknown as PubSubService,
    );
  });

  describe('create()', () => {
    it('creates household with OWNER role, first color #FF6B6B, all 5 circles, and UUIDv7 id', async () => {
      mockRepo.findByUserId.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(createMockHousehold());

      const result = await service.create('user-1', { name: 'Test Household' });

      expect(mockRepo.create).toHaveBeenCalledWith({
        id: 'test-uuid-v7',
        name: 'Test Household',
        ownerId: 'user-1',
        ownerColor: '#FF6B6B',
        circles: [
          CircleType.PERSONAL,
          CircleType.COUPLE,
          CircleType.HOUSEHOLD,
          CircleType.EXTENDED_FAMILY,
          CircleType.ACQUAINTANCES,
        ],
      });
      expect(result.id).toBe('hh-1');
      expect(result.name).toBe('Test Household');
    });

    it('throws HouseholdAlreadyExistsException when user already has a household', async () => {
      mockRepo.findByUserId.mockResolvedValue(createMockHousehold());

      await expect(service.create('user-1', { name: 'New' })).rejects.toThrow(
        HouseholdAlreadyExistsException,
      );
    });

    it('throws HouseholdNameInvalidException on empty name', async () => {
      await expect(service.create('user-1', { name: '' })).rejects.toThrow(
        HouseholdNameInvalidException,
      );
    });

    it('throws HouseholdNameInvalidException on name > 100 chars', async () => {
      await expect(service.create('user-1', { name: 'a'.repeat(101) })).rejects.toThrow(
        HouseholdNameInvalidException,
      );
    });

    it('trims whitespace from name before creation', async () => {
      mockRepo.findByUserId.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(createMockHousehold({ name: 'Trimmed' }));

      await service.create('user-1', { name: '  Trimmed  ' });

      expect(mockRepo.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Trimmed' }));
    });

    it('passes exactly 5 CircleType values', async () => {
      mockRepo.findByUserId.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(createMockHousehold());

      await service.create('user-1', { name: 'Test' });

      const callArgs = mockRepo.create.mock.calls[0] as [{ circles: CircleType[] }];
      expect(callArgs[0].circles).toHaveLength(5);
      expect(callArgs[0].circles).toEqual([
        'PERSONAL',
        'COUPLE',
        'HOUSEHOLD',
        'EXTENDED_FAMILY',
        'ACQUAINTANCES',
      ]);
    });
  });

  describe('findMyHousehold()', () => {
    it('returns null when user has no household', async () => {
      mockRepo.findByUserId.mockResolvedValue(null);

      const result = await service.findMyHousehold('user-1');

      expect(result).toBeNull();
    });

    it('returns HouseholdModel with correct mappings', async () => {
      mockRepo.findByUserId.mockResolvedValue(createMockHousehold());

      const result = await service.findMyHousehold('user-1');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('hh-1');
      expect(result?.name).toBe('Test Household');
      expect(result?.membersCount).toBe(1);
      expect(result?.members).toHaveLength(1);
      expect(result?.members[0]?.role).toBe('OWNER');
    });
  });

  describe('update()', () => {
    it('updates name when user is OWNER and returns updated model', async () => {
      mockRepo.findByUserId.mockResolvedValue(createMockHousehold());
      mockRepo.update.mockResolvedValue(createMockHousehold({ name: 'Updated' }));

      const result = await service.update('user-1', { name: 'Updated' });

      expect(mockRepo.update).toHaveBeenCalledWith('hh-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('throws HouseholdNotFoundException when no household found', async () => {
      mockRepo.findByUserId.mockResolvedValue(null);

      await expect(service.update('user-1', { name: 'Updated' })).rejects.toThrow(
        HouseholdNotFoundException,
      );
    });

    it('throws NotHouseholdOwnerException when user role is ADULT', async () => {
      const household = createMockHousehold({
        members: [
          {
            id: 'm-1',
            role: 'ADULT',
            color: '#FF6B6B',
            joinedAt: new Date(),
            userId: 'user-1',
            user: { name: 'Test', email: 'test@example.com' },
          },
        ],
      });
      mockRepo.findByUserId.mockResolvedValue(household);

      await expect(service.update('user-1', { name: 'Updated' })).rejects.toThrow(
        NotHouseholdOwnerException,
      );
    });

    it('throws NotHouseholdOwnerException when user not found in members array', async () => {
      const household = createMockHousehold({
        members: [
          {
            id: 'm-1',
            role: 'OWNER',
            color: '#FF6B6B',
            joinedAt: new Date(),
            userId: 'other-user',
            user: { name: 'Other', email: 'other@example.com' },
          },
        ],
      });
      mockRepo.findByUserId.mockResolvedValue(household);

      await expect(service.update('user-1', { name: 'Updated' })).rejects.toThrow(
        NotHouseholdOwnerException,
      );
    });

    it('throws HouseholdNameInvalidException on empty name', async () => {
      await expect(service.update('user-1', { name: '' })).rejects.toThrow(
        HouseholdNameInvalidException,
      );
    });

    it('throws HouseholdNameInvalidException on name > 100 chars', async () => {
      await expect(service.update('user-1', { name: 'a'.repeat(101) })).rejects.toThrow(
        HouseholdNameInvalidException,
      );
    });
  });

  describe('delete()', () => {
    it('deletes and returns true when user is OWNER', async () => {
      mockRepo.findByUserId.mockResolvedValue(createMockHousehold());
      mockRepo.delete.mockResolvedValue(undefined);

      const result = await service.delete('user-1');

      expect(result).toBe(true);
      expect(mockRepo.delete).toHaveBeenCalledWith('hh-1');
    });

    it('throws HouseholdNotFoundException when no household', async () => {
      mockRepo.findByUserId.mockResolvedValue(null);

      await expect(service.delete('user-1')).rejects.toThrow(HouseholdNotFoundException);
    });

    it('throws NotHouseholdOwnerException when not OWNER', async () => {
      const household = createMockHousehold({
        members: [
          {
            id: 'm-1',
            role: 'ADULT',
            color: '#FF6B6B',
            joinedAt: new Date(),
            userId: 'user-1',
            user: { name: 'Test', email: 'test@example.com' },
          },
        ],
      });
      mockRepo.findByUserId.mockResolvedValue(household);

      await expect(service.delete('user-1')).rejects.toThrow(NotHouseholdOwnerException);
    });
  });

  describe('findById()', () => {
    it('returns model when household exists', async () => {
      mockRepo.findById.mockResolvedValue(createMockHousehold());

      const result = await service.findById('hh-1');

      expect(result.id).toBe('hh-1');
      expect(result.name).toBe('Test Household');
    });

    it('throws HouseholdNotFoundException when null', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.findById('hh-1')).rejects.toThrow(HouseholdNotFoundException);
    });
  });

  describe('model mapping', () => {
    it('maps all member fields correctly', async () => {
      mockRepo.findByUserId.mockResolvedValue(createMockHousehold());

      const result = await service.findMyHousehold('user-1');
      const member = result?.members[0];

      expect(member?.id).toBe('m-1');
      expect(member?.role).toBe('OWNER');
      expect(member?.color).toBe('#FF6B6B');
      expect(member?.joinedAt).toEqual(new Date('2024-01-01'));
      expect(member?.userId).toBe('user-1');
      expect(member?.userName).toBe('Test User');
      expect(member?.userEmail).toBe('test@example.com');
    });

    it('computes membersCount from members array length', async () => {
      const household = createMockHousehold({
        members: [
          {
            id: 'm-1',
            role: 'OWNER',
            color: '#FF6B6B',
            joinedAt: new Date(),
            userId: 'user-1',
            user: { name: 'User 1', email: 'u1@example.com' },
          },
          {
            id: 'm-2',
            role: 'ADULT',
            color: '#4ECDC4',
            joinedAt: new Date(),
            userId: 'user-2',
            user: { name: 'User 2', email: 'u2@example.com' },
          },
        ],
      });
      mockRepo.findByUserId.mockResolvedValue(household);

      const result = await service.findMyHousehold('user-1');

      expect(result?.membersCount).toBe(2);
    });
  });
});
