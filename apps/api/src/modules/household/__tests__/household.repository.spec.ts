import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CircleType } from '@family-hub/shared';
import { HouseholdRepository } from '../household.repository';
import type { PrismaService } from '../../prisma/prisma.service';

const mockUuidv7 = vi.fn<() => string>();

vi.mock('uuid', () => ({
  v7: (...args: unknown[]) => mockUuidv7(...(args as [])),
}));

const mockPrisma = {
  household: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  householdMember: {
    findFirst: vi.fn(),
    count: vi.fn(),
  },
};

describe('HouseholdRepository', () => {
  let repo: HouseholdRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the counter so each test gets predictable UUIDs
    let callCount = 0;
    mockUuidv7.mockImplementation(() => `mock-uuid-${++callCount}`);
    repo = new HouseholdRepository(mockPrisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('calls prisma.household.create with nested circles and member', async () => {
      const data = {
        id: 'h-1',
        name: 'Family',
        ownerId: 'user-1',
        ownerColor: '#FF0000',
        circles: [CircleType.PERSONAL, CircleType.COUPLE],
      };
      const expected = { id: 'h-1', name: 'Family', members: [] };
      mockPrisma.household.create.mockResolvedValue(expected);

      const result = await repo.create(data);

      // uuidv7 is called 3 times: once per circle (2) + once for the member (1)
      expect(mockUuidv7).toHaveBeenCalledTimes(3);
      expect(mockPrisma.household.create).toHaveBeenCalledWith({
        data: {
          id: 'h-1',
          name: 'Family',
          circles: {
            createMany: {
              data: [
                { id: 'mock-uuid-1', type: 'PERSONAL' },
                { id: 'mock-uuid-2', type: 'COUPLE' },
              ],
            },
          },
          members: {
            create: {
              id: 'mock-uuid-3',
              userId: 'user-1',
              role: 'OWNER',
              color: '#FF0000',
            },
          },
        },
        include: { members: { include: { user: true } } },
      });
      expect(result).toBe(expected);
    });
  });

  describe('findById', () => {
    it('calls prisma.household.findUnique with id and include', async () => {
      const expected = { id: 'h-1', name: 'Test' };
      mockPrisma.household.findUnique.mockResolvedValue(expected);

      const result = await repo.findById('h-1');

      expect(mockPrisma.household.findUnique).toHaveBeenCalledWith({
        where: { id: 'h-1' },
        include: { members: { include: { user: true } } },
      });
      expect(result).toBe(expected);
    });
  });

  describe('findByUserId', () => {
    it('returns member.household when member is found', async () => {
      const household = { id: 'h-1', name: 'Test' };
      mockPrisma.householdMember.findFirst.mockResolvedValue({ household });

      const result = await repo.findByUserId('user-1');

      expect(mockPrisma.householdMember.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: {
          household: {
            include: { members: { include: { user: true } } },
          },
        },
      });
      expect(result).toBe(household);
    });

    it('returns null when no member found', async () => {
      mockPrisma.householdMember.findFirst.mockResolvedValue(null);

      const result = await repo.findByUserId('user-1');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('calls prisma.household.update with id, name, and include', async () => {
      const expected = { id: 'h-1', name: 'Updated' };
      mockPrisma.household.update.mockResolvedValue(expected);

      const result = await repo.update('h-1', { name: 'Updated' });

      expect(mockPrisma.household.update).toHaveBeenCalledWith({
        where: { id: 'h-1' },
        data: { name: 'Updated' },
        include: { members: { include: { user: true } } },
      });
      expect(result).toBe(expected);
    });
  });

  describe('delete', () => {
    it('calls prisma.household.delete with id', async () => {
      mockPrisma.household.delete.mockResolvedValue({ id: 'h-1' });

      await repo.delete('h-1');

      expect(mockPrisma.household.delete).toHaveBeenCalledWith({
        where: { id: 'h-1' },
      });
    });
  });

  describe('countMembersByHouseholdId', () => {
    it('calls prisma.householdMember.count with householdId', async () => {
      mockPrisma.householdMember.count.mockResolvedValue(3);

      const result = await repo.countMembersByHouseholdId('h-1');

      expect(mockPrisma.householdMember.count).toHaveBeenCalledWith({
        where: { householdId: 'h-1' },
      });
      expect(result).toBe(3);
    });
  });
});
