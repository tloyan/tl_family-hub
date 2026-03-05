import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvitationRepository } from '../invitation.repository';
import type { PrismaService } from '../../prisma/prisma.service';

const mockBypassClient = {
  invitation: {
    findUnique: vi.fn(),
    update: vi.fn(),
    count: vi.fn(),
  },
  householdMember: {
    count: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
};

const mockPrisma = {
  invitation: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
  },
  bypassHouseholdFilter: vi.fn(() => mockBypassClient),
};

const includeRelations = {
  invitedBy: { select: { name: true, email: true } },
  acceptedBy: { select: { name: true, email: true } },
  household: { select: { name: true } },
  linkedMemberProfile: { select: { id: true, color: true, role: true } },
};

describe('InvitationRepository', () => {
  let repo: InvitationRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repo = new InvitationRepository(mockPrisma as unknown as PrismaService);
  });

  describe('scoped methods', () => {
    it('create calls prisma.invitation.create with data and include', async () => {
      const data = {
        id: 'inv-1',
        token: 'token-1',
        role: 'ADULT' as const,
        relation: 'Spouse',
        status: 'PENDING' as const,
        email: 'test@example.com',
        expiresAt: new Date(),
        householdId: 'hh-1',
        invitedByUserId: 'user-1',
      };
      const expected = { id: 'inv-1' };
      mockPrisma.invitation.create.mockResolvedValue(expected);

      const result = await repo.create(data);

      expect(mockPrisma.invitation.create).toHaveBeenCalledWith({
        data,
        include: includeRelations,
      });
      expect(result).toBe(expected);
    });

    it('findByHousehold calls prisma.invitation.findMany with where, orderBy, and include', async () => {
      const expected = [{ id: 'inv-1' }];
      mockPrisma.invitation.findMany.mockResolvedValue(expected);

      const result = await repo.findByHousehold('hh-1');

      expect(mockPrisma.invitation.findMany).toHaveBeenCalledWith({
        where: { householdId: 'hh-1' },
        orderBy: { createdAt: 'desc' },
        include: includeRelations,
      });
      expect(result).toBe(expected);
    });

    it('findById calls prisma.invitation.findUnique with where and include', async () => {
      const expected = { id: 'inv-1' };
      mockPrisma.invitation.findUnique.mockResolvedValue(expected);

      const result = await repo.findById('inv-1');

      expect(mockPrisma.invitation.findUnique).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        include: includeRelations,
      });
      expect(result).toBe(expected);
    });

    it('scoped methods do NOT call bypassHouseholdFilter', async () => {
      mockPrisma.invitation.create.mockResolvedValue({});
      mockPrisma.invitation.findMany.mockResolvedValue([]);
      mockPrisma.invitation.findUnique.mockResolvedValue(null);

      await repo.create({
        id: 'inv-1',
        token: 't',
        role: 'ADULT' as const,
        relation: 'Spouse',
        status: 'PENDING' as const,
        expiresAt: new Date(),
        householdId: 'hh-1',
        invitedByUserId: 'user-1',
      });
      await repo.findByHousehold('hh-1');
      await repo.findById('inv-1');

      expect(mockPrisma.bypassHouseholdFilter).not.toHaveBeenCalled();
    });
  });

  describe('bypassed methods', () => {
    it('findByToken calls bypassHouseholdFilter().invitation.findUnique', async () => {
      const expected = { id: 'inv-1' };
      mockBypassClient.invitation.findUnique.mockResolvedValue(expected);

      const result = await repo.findByToken('token-1');

      expect(mockPrisma.bypassHouseholdFilter).toHaveBeenCalled();
      expect(mockBypassClient.invitation.findUnique).toHaveBeenCalledWith({
        where: { token: 'token-1' },
        include: includeRelations,
      });
      expect(result).toBe(expected);
    });

    it('updateStatus calls bypassHouseholdFilter().invitation.update', async () => {
      const data = { status: 'CANCELLED' as const };
      const expected = { id: 'inv-1', status: 'CANCELLED' };
      mockBypassClient.invitation.update.mockResolvedValue(expected);

      const result = await repo.updateStatus('inv-1', data);

      expect(mockPrisma.bypassHouseholdFilter).toHaveBeenCalled();
      expect(mockBypassClient.invitation.update).toHaveBeenCalledWith({
        where: { id: 'inv-1' },
        data,
        include: includeRelations,
      });
      expect(result).toBe(expected);
    });

    it('countPendingByHousehold calls bypassHouseholdFilter().invitation.count', async () => {
      mockBypassClient.invitation.count.mockResolvedValue(5);

      const result = await repo.countPendingByHousehold('hh-1');

      expect(mockPrisma.bypassHouseholdFilter).toHaveBeenCalled();
      expect(mockBypassClient.invitation.count).toHaveBeenCalledWith({
        where: { householdId: 'hh-1', status: 'PENDING' },
      });
      expect(result).toBe(5);
    });

    it('countMembersByHousehold calls bypassHouseholdFilter().householdMember.count', async () => {
      mockBypassClient.householdMember.count.mockResolvedValue(3);

      const result = await repo.countMembersByHousehold('hh-1');

      expect(mockPrisma.bypassHouseholdFilter).toHaveBeenCalled();
      expect(mockBypassClient.householdMember.count).toHaveBeenCalledWith({
        where: { householdId: 'hh-1' },
      });
      expect(result).toBe(3);
    });

    it('findMemberByUserId calls bypassHouseholdFilter().householdMember.findFirst', async () => {
      const expected = { id: 'm-1', userId: 'user-1' };
      mockBypassClient.householdMember.findFirst.mockResolvedValue(expected);

      const result = await repo.findMemberByUserId('user-1', 'hh-1');

      expect(mockPrisma.bypassHouseholdFilter).toHaveBeenCalled();
      expect(mockBypassClient.householdMember.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-1', householdId: 'hh-1' },
      });
      expect(result).toBe(expected);
    });

    it('createMember calls bypassHouseholdFilter().householdMember.create', async () => {
      const data = {
        id: 'm-1',
        role: 'ADULT' as const,
        color: '#FF6B6B',
        userId: 'user-1',
        householdId: 'hh-1',
      };
      const expected = { ...data, user: { name: 'Test', email: 'test@example.com' } };
      mockBypassClient.householdMember.create.mockResolvedValue(expected);

      const result = await repo.createMember(data);

      expect(mockPrisma.bypassHouseholdFilter).toHaveBeenCalled();
      expect(mockBypassClient.householdMember.create).toHaveBeenCalledWith({
        data,
        include: { user: { select: { name: true, email: true } } },
      });
      expect(result).toBe(expected);
    });

    it('linkMemberToUser calls bypassHouseholdFilter().householdMember.update', async () => {
      const expected = { id: 'm-1', userId: 'user-2' };
      mockBypassClient.householdMember.update.mockResolvedValue(expected);

      const result = await repo.linkMemberToUser('m-1', 'user-2');

      expect(mockPrisma.bypassHouseholdFilter).toHaveBeenCalled();
      expect(mockBypassClient.householdMember.update).toHaveBeenCalledWith({
        where: { id: 'm-1' },
        data: { userId: 'user-2' },
        include: { user: { select: { name: true, email: true } } },
      });
      expect(result).toBe(expected);
    });

    it('all bypassed methods DO call bypassHouseholdFilter', async () => {
      mockBypassClient.invitation.findUnique.mockResolvedValue(null);
      mockBypassClient.invitation.update.mockResolvedValue({});
      mockBypassClient.invitation.count.mockResolvedValue(0);
      mockBypassClient.householdMember.count.mockResolvedValue(0);
      mockBypassClient.householdMember.findFirst.mockResolvedValue(null);
      mockBypassClient.householdMember.create.mockResolvedValue({});
      mockBypassClient.householdMember.update.mockResolvedValue({});

      await repo.findByToken('t');
      await repo.updateStatus('id', { status: 'CANCELLED' as const });
      await repo.countPendingByHousehold('hh-1');
      await repo.countMembersByHousehold('hh-1');
      await repo.findMemberByUserId('u', 'hh-1');
      await repo.createMember({
        id: 'id',
        role: 'ADULT' as const,
        color: '#FFF',
        userId: 'u',
        householdId: 'hh-1',
      });
      await repo.linkMemberToUser('m', 'u');

      expect(mockPrisma.bypassHouseholdFilter).toHaveBeenCalledTimes(7);
    });
  });
});
