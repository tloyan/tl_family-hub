import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvitationService } from '../invitation.service';
import { InvitationRepository } from '../invitation.repository';
import type { PubSubService } from '../../../common/pubsub';
import {
  InvitationNotFoundException,
  InvitationExpiredException,
  InvitationAlreadyAcceptedException,
  InvitationCancelledException,
  InvitationLimitReachedException,
  NotInvitationOwnerException,
  CannotInviteSelfException,
  InvitationInputInvalidException,
} from '../../../common/exceptions/invitation.exception';

vi.mock('uuid', () => ({ v7: vi.fn(() => 'test-uuid-v7') }));
vi.mock('crypto', () => ({
  randomBytes: vi.fn(() => ({ toString: vi.fn(() => 'mock-token-base64url') })),
}));
const mockResendSend = vi.fn().mockResolvedValue({ id: 'email-1' });
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mockResendSend };
  },
}));
vi.mock('@family-hub/emails', () => ({
  renderInvitationEmail: vi.fn(() => ({ html: '<html>test</html>', subject: 'Test Subject' })),
}));

const mockRepo = {
  create: vi.fn(),
  findByToken: vi.fn(),
  findByHousehold: vi.fn(),
  findById: vi.fn(),
  updateStatus: vi.fn(),
  countPendingByHousehold: vi.fn(),
  countMembersByHousehold: vi.fn(),
  findMemberByUserId: vi.fn(),
  createMember: vi.fn(),
  linkMemberToUser: vi.fn(),
};

const mockPubSub = {
  publish: vi.fn().mockResolvedValue(undefined),
  asyncIterableIterator: vi.fn(),
};

function createMockInvitation(overrides: Record<string, unknown> = {}) {
  return {
    id: 'inv-1',
    token: 'mock-token',
    role: 'ADULT',
    relation: 'Spouse',
    status: 'PENDING',
    email: 'invite@example.com',
    expiresAt: new Date('2030-01-01'),
    acceptedAt: null,
    createdAt: new Date('2024-01-01'),
    householdId: 'hh-1',
    invitedByUserId: 'user-1',
    invitedBy: { name: 'Test User', email: 'test@example.com' },
    acceptedByUserId: null,
    linkedMemberProfileId: null,
    household: { name: 'Test Household' },
    linkedMemberProfile: null,
    ...overrides,
  };
}

function createMockMember(overrides: Record<string, unknown> = {}) {
  return {
    id: 'm-1',
    role: 'OWNER',
    color: '#FF6B6B',
    joinedAt: new Date('2024-01-01'),
    userId: 'user-1',
    householdId: 'hh-1',
    user: { name: 'Test User', email: 'test@example.com' },
    ...overrides,
  };
}

describe('InvitationService', () => {
  let service: InvitationService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new InvitationService(
      mockRepo as unknown as InvitationRepository,
      mockPubSub as unknown as PubSubService,
    );
  });

  describe('createInvitation()', () => {
    const validInput = { role: 'ADULT' as const, relation: 'Spouse', email: 'invite@example.com' };

    it('creates invitation with token, uuid, 7-day expiry, and correct fields', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember());
      mockRepo.countMembersByHousehold.mockResolvedValue(1);
      mockRepo.countPendingByHousehold.mockResolvedValue(0);
      mockRepo.create.mockResolvedValue(createMockInvitation());

      await service.createInvitation('user-1', 'hh-1', validInput);

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid-v7',
          token: 'mock-token-base64url',
          role: 'ADULT',
          relation: 'Spouse',
          status: 'PENDING',
          email: 'invite@example.com',
          householdId: 'hh-1',
          invitedByUserId: 'user-1',
        }),
      );
      const callArgs = mockRepo.create.mock.calls[0][0] as { expiresAt: Date };
      expect(callArgs.expiresAt).toBeInstanceOf(Date);
    });

    it('throws InvitationInputInvalidException on empty relation', async () => {
      await expect(
        service.createInvitation('user-1', 'hh-1', { role: 'ADULT', relation: '' }),
      ).rejects.toThrow(InvitationInputInvalidException);
    });

    it('throws InvitationInputInvalidException on bad email format', async () => {
      await expect(
        service.createInvitation('user-1', 'hh-1', {
          role: 'ADULT',
          relation: 'Spouse',
          email: 'not-an-email',
        }),
      ).rejects.toThrow(InvitationInputInvalidException);
    });

    it('throws NotInvitationOwnerException when user is not a member', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(null);

      await expect(service.createInvitation('user-1', 'hh-1', validInput)).rejects.toThrow(
        NotInvitationOwnerException,
      );
    });

    it('throws NotInvitationOwnerException when user role is ADULT', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember({ role: 'ADULT' }));

      await expect(service.createInvitation('user-1', 'hh-1', validInput)).rejects.toThrow(
        NotInvitationOwnerException,
      );
    });

    it('allows ADMIN role to create invitations', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember({ role: 'ADMIN' }));
      mockRepo.countMembersByHousehold.mockResolvedValue(1);
      mockRepo.countPendingByHousehold.mockResolvedValue(0);
      mockRepo.create.mockResolvedValue(createMockInvitation());

      await expect(service.createInvitation('user-1', 'hh-1', validInput)).resolves.not.toThrow();
      expect(mockRepo.create).toHaveBeenCalled();
    });

    it('throws InvitationLimitReachedException when members + pending >= 20', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember());
      mockRepo.countMembersByHousehold.mockResolvedValue(15);
      mockRepo.countPendingByHousehold.mockResolvedValue(5);

      await expect(service.createInvitation('user-1', 'hh-1', validInput)).rejects.toThrow(
        InvitationLimitReachedException,
      );
    });

    it('throws InvitationLimitReachedException when pending >= 10', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember());
      mockRepo.countMembersByHousehold.mockResolvedValue(5);
      mockRepo.countPendingByHousehold.mockResolvedValue(10);

      await expect(service.createInvitation('user-1', 'hh-1', validInput)).rejects.toThrow(
        InvitationLimitReachedException,
      );
    });

    it('sends email when input.email is provided', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember());
      mockRepo.countMembersByHousehold.mockResolvedValue(1);
      mockRepo.countPendingByHousehold.mockResolvedValue(0);
      mockRepo.create.mockResolvedValue(createMockInvitation());

      const { renderInvitationEmail } = await import('@family-hub/emails');

      await service.createInvitation('user-1', 'hh-1', validInput);

      expect(renderInvitationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          inviterName: 'Test User',
          householdName: 'Test Household',
          relation: 'Spouse',
        }),
      );
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'invite@example.com',
          subject: 'Test Subject',
          html: '<html>test</html>',
        }),
      );
    });

    it('does not send email when input.email is absent', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember());
      mockRepo.countMembersByHousehold.mockResolvedValue(1);
      mockRepo.countPendingByHousehold.mockResolvedValue(0);
      mockRepo.create.mockResolvedValue(createMockInvitation({ email: null }));

      const { renderInvitationEmail } = await import('@family-hub/emails');

      await service.createInvitation('user-1', 'hh-1', { role: 'ADULT', relation: 'Spouse' });

      expect(renderInvitationEmail).not.toHaveBeenCalled();
      expect(mockResendSend).not.toHaveBeenCalled();
    });

    it('does not throw when email send fails', async () => {
      mockResendSend.mockRejectedValueOnce(new Error('Email failed'));

      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember());
      mockRepo.countMembersByHousehold.mockResolvedValue(1);
      mockRepo.countPendingByHousehold.mockResolvedValue(0);
      mockRepo.create.mockResolvedValue(createMockInvitation());

      const result = await service.createInvitation('user-1', 'hh-1', validInput);
      expect(result).toBeDefined();
    });
  });

  describe('acceptInvitation()', () => {
    it('throws InvitationInputInvalidException on empty token', async () => {
      await expect(service.acceptInvitation('user-2', { token: '' })).rejects.toThrow(
        InvitationInputInvalidException,
      );
    });

    it('throws InvitationNotFoundException when token not found', async () => {
      mockRepo.findByToken.mockResolvedValue(null);

      await expect(service.acceptInvitation('user-2', { token: 'missing-token' })).rejects.toThrow(
        InvitationNotFoundException,
      );
    });

    it('throws InvitationAlreadyAcceptedException when status is ACCEPTED', async () => {
      mockRepo.findByToken.mockResolvedValue(createMockInvitation({ status: 'ACCEPTED' }));

      await expect(service.acceptInvitation('user-2', { token: 'mock-token' })).rejects.toThrow(
        InvitationAlreadyAcceptedException,
      );
    });

    it('throws InvitationCancelledException when status is CANCELLED', async () => {
      mockRepo.findByToken.mockResolvedValue(createMockInvitation({ status: 'CANCELLED' }));

      await expect(service.acceptInvitation('user-2', { token: 'mock-token' })).rejects.toThrow(
        InvitationCancelledException,
      );
    });

    it('throws InvitationExpiredException when status is EXPIRED', async () => {
      mockRepo.findByToken.mockResolvedValue(createMockInvitation({ status: 'EXPIRED' }));

      await expect(service.acceptInvitation('user-2', { token: 'mock-token' })).rejects.toThrow(
        InvitationExpiredException,
      );
    });

    it('updates to EXPIRED and throws when PENDING but past expiresAt', async () => {
      mockRepo.findByToken.mockResolvedValue(
        createMockInvitation({ status: 'PENDING', expiresAt: new Date('2020-01-01') }),
      );
      mockRepo.updateStatus.mockResolvedValue(createMockInvitation({ status: 'EXPIRED' }));

      await expect(service.acceptInvitation('user-2', { token: 'mock-token' })).rejects.toThrow(
        InvitationExpiredException,
      );

      expect(mockRepo.updateStatus).toHaveBeenCalledWith('inv-1', {
        status: 'EXPIRED',
      });
    });

    it('throws CannotInviteSelfException when user is already a member', async () => {
      mockRepo.findByToken.mockResolvedValue(createMockInvitation());
      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember({ userId: 'user-2' }));

      await expect(service.acceptInvitation('user-2', { token: 'mock-token' })).rejects.toThrow(
        CannotInviteSelfException,
      );
    });

    it('creates new member when no linked profile (Case 1)', async () => {
      mockRepo.findByToken.mockResolvedValue(createMockInvitation());
      mockRepo.findMemberByUserId.mockResolvedValue(null);
      mockRepo.countMembersByHousehold.mockResolvedValue(2);
      mockRepo.createMember.mockResolvedValue(
        createMockMember({ userId: 'user-2', color: '#45B7D1' }),
      );
      mockRepo.updateStatus.mockResolvedValue(createMockInvitation({ status: 'ACCEPTED' }));

      await service.acceptInvitation('user-2', { token: 'mock-token' });

      expect(mockRepo.createMember).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'test-uuid-v7',
          role: 'ADULT',
          color: '#45B7D1',
          userId: 'user-2',
          householdId: 'hh-1',
        }),
      );
      expect(mockRepo.linkMemberToUser).not.toHaveBeenCalled();
    });

    it('links existing member profile when linkedMemberProfileId is set (Case 2)', async () => {
      mockRepo.findByToken.mockResolvedValue(
        createMockInvitation({ linkedMemberProfileId: 'profile-1' }),
      );
      mockRepo.findMemberByUserId.mockResolvedValue(null);
      mockRepo.linkMemberToUser.mockResolvedValue(
        createMockMember({ id: 'profile-1', userId: 'user-2' }),
      );
      mockRepo.updateStatus.mockResolvedValue(createMockInvitation({ status: 'ACCEPTED' }));

      await service.acceptInvitation('user-2', { token: 'mock-token' });

      expect(mockRepo.linkMemberToUser).toHaveBeenCalledWith('profile-1', 'user-2');
      expect(mockRepo.createMember).not.toHaveBeenCalled();
    });

    it('publishes to correct topics and updates status to ACCEPTED', async () => {
      mockRepo.findByToken.mockResolvedValue(createMockInvitation());
      mockRepo.findMemberByUserId.mockResolvedValue(null);
      mockRepo.countMembersByHousehold.mockResolvedValue(1);
      mockRepo.createMember.mockResolvedValue(createMockMember({ userId: 'user-2' }));
      mockRepo.updateStatus.mockResolvedValue(createMockInvitation({ status: 'ACCEPTED' }));

      await service.acceptInvitation('user-2', { token: 'mock-token' });

      expect(mockRepo.updateStatus).toHaveBeenCalledWith('inv-1', {
        status: 'ACCEPTED',
        acceptedAt: expect.any(Date) as unknown,
        acceptedByUserId: 'user-2',
      });
      expect(mockPubSub.publish).toHaveBeenCalledWith(
        'invitation.accepted',
        expect.objectContaining({ invitationAccepted: expect.any(Object) as unknown }),
      );
      expect(mockPubSub.publish).toHaveBeenCalledWith(
        'household.member_changed',
        expect.objectContaining({ householdMemberChanged: expect.any(Object) as unknown }),
      );
    });

    it('uses getNextColor with actual members count', async () => {
      mockRepo.findByToken.mockResolvedValue(createMockInvitation());
      mockRepo.findMemberByUserId.mockResolvedValue(null);
      mockRepo.countMembersByHousehold.mockResolvedValue(3);
      mockRepo.createMember.mockResolvedValue(
        createMockMember({ userId: 'user-2', color: '#96CEB4' }),
      );
      mockRepo.updateStatus.mockResolvedValue(createMockInvitation({ status: 'ACCEPTED' }));

      await service.acceptInvitation('user-2', { token: 'mock-token' });

      // getNextColor(3) = MEMBER_COLORS[3] = '#96CEB4'
      expect(mockRepo.createMember).toHaveBeenCalledWith(
        expect.objectContaining({ color: '#96CEB4' }),
      );
    });

    it('returns correctly mapped HouseholdMemberModel', async () => {
      mockRepo.findByToken.mockResolvedValue(createMockInvitation());
      mockRepo.findMemberByUserId.mockResolvedValue(null);
      mockRepo.countMembersByHousehold.mockResolvedValue(1);
      mockRepo.createMember.mockResolvedValue(
        createMockMember({ id: 'm-new', userId: 'user-2', role: 'ADULT', color: '#4ECDC4' }),
      );
      mockRepo.updateStatus.mockResolvedValue(createMockInvitation({ status: 'ACCEPTED' }));

      const result = await service.acceptInvitation('user-2', { token: 'mock-token' });

      expect(result.id).toBe('m-new');
      expect(result.role).toBe('ADULT');
      expect(result.color).toBe('#4ECDC4');
      expect(result.userId).toBe('user-2');
      expect(result.householdId).toBe('hh-1');
      expect(result.userName).toBe('Test User');
      expect(result.userEmail).toBe('test@example.com');
    });
  });

  describe('cancelInvitation()', () => {
    it('cancels a PENDING invitation', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember());
      mockRepo.findById.mockResolvedValue(createMockInvitation());
      mockRepo.updateStatus.mockResolvedValue(createMockInvitation({ status: 'CANCELLED' }));

      const result = await service.cancelInvitation('user-1', 'hh-1', 'inv-1');

      expect(mockRepo.updateStatus).toHaveBeenCalledWith('inv-1', {
        status: 'CANCELLED',
      });
      expect(result.status).toBe('CANCELLED');
    });

    it('throws NotInvitationOwnerException when user role is ADULT', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember({ role: 'ADULT' }));

      await expect(service.cancelInvitation('user-1', 'hh-1', 'inv-1')).rejects.toThrow(
        NotInvitationOwnerException,
      );
    });

    it('throws NotInvitationOwnerException when user is not a member', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(null);

      await expect(service.cancelInvitation('user-1', 'hh-1', 'inv-1')).rejects.toThrow(
        NotInvitationOwnerException,
      );
    });

    it('throws InvitationNotFoundException when invitation not found', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember());
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.cancelInvitation('user-1', 'hh-1', 'inv-1')).rejects.toThrow(
        InvitationNotFoundException,
      );
    });

    it('throws InvitationAlreadyAcceptedException when status is not PENDING', async () => {
      mockRepo.findMemberByUserId.mockResolvedValue(createMockMember());
      mockRepo.findById.mockResolvedValue(createMockInvitation({ status: 'ACCEPTED' }));

      await expect(service.cancelInvitation('user-1', 'hh-1', 'inv-1')).rejects.toThrow(
        InvitationAlreadyAcceptedException,
      );
    });
  });

  describe('listInvitations()', () => {
    it('returns mapped array of invitations', async () => {
      mockRepo.findByHousehold.mockResolvedValue([
        createMockInvitation({ id: 'inv-1' }),
        createMockInvitation({ id: 'inv-2' }),
      ]);

      const result = await service.listInvitations('hh-1');

      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe('inv-1');
      expect(result[1]?.id).toBe('inv-2');
    });

    it('returns empty array when no invitations', async () => {
      mockRepo.findByHousehold.mockResolvedValue([]);

      const result = await service.listInvitations('hh-1');

      expect(result).toEqual([]);
    });
  });

  describe('getInvitationByToken()', () => {
    it('returns InvitationPublicModel for valid PENDING invitation', async () => {
      mockRepo.findByToken.mockResolvedValue(createMockInvitation());

      const result = await service.getInvitationByToken('mock-token');

      expect(result.householdName).toBe('Test Household');
      expect(result.inviterName).toBe('Test User');
      expect(result.role).toBe('ADULT');
      expect(result.relation).toBe('Spouse');
      expect(result.status).toBe('PENDING');
    });

    it('throws InvitationNotFoundException when token not found', async () => {
      mockRepo.findByToken.mockResolvedValue(null);

      await expect(service.getInvitationByToken('missing')).rejects.toThrow(
        InvitationNotFoundException,
      );
    });

    it('updates status to EXPIRED when PENDING but past expiresAt', async () => {
      mockRepo.findByToken.mockResolvedValue(
        createMockInvitation({ status: 'PENDING', expiresAt: new Date('2020-01-01') }),
      );
      mockRepo.updateStatus.mockResolvedValue(createMockInvitation({ status: 'EXPIRED' }));

      const result = await service.getInvitationByToken('mock-token');

      expect(mockRepo.updateStatus).toHaveBeenCalledWith('inv-1', { status: 'EXPIRED' });
      expect(result.status).toBe('EXPIRED');
    });

    it('maps linkedMemberProfile when present', async () => {
      mockRepo.findByToken.mockResolvedValue(
        createMockInvitation({
          linkedMemberProfile: { id: 'profile-1', color: '#FF6B6B', role: 'ADULT' },
        }),
      );

      const result = await service.getInvitationByToken('mock-token');

      expect(result.linkedMemberProfile).toBeDefined();
      expect(result.linkedMemberProfile?.id).toBe('profile-1');
      expect(result.linkedMemberProfile?.color).toBe('#FF6B6B');
      expect(result.linkedMemberProfile?.role).toBe('ADULT');
    });
  });

  describe('model mapping', () => {
    it('toModel maps all InvitationModel fields', async () => {
      mockRepo.findByHousehold.mockResolvedValue([
        createMockInvitation({
          acceptedAt: new Date('2024-02-01'),
          acceptedByUserId: 'user-2',
          linkedMemberProfileId: 'profile-1',
        }),
      ]);

      const [result] = await service.listInvitations('hh-1');

      expect(result?.id).toBe('inv-1');
      expect(result?.token).toBe('mock-token');
      expect(result?.role).toBe('ADULT');
      expect(result?.relation).toBe('Spouse');
      expect(result?.status).toBe('PENDING');
      expect(result?.email).toBe('invite@example.com');
      expect(result?.expiresAt).toEqual(new Date('2030-01-01'));
      expect(result?.acceptedAt).toEqual(new Date('2024-02-01'));
      expect(result?.createdAt).toEqual(new Date('2024-01-01'));
      expect(result?.householdId).toBe('hh-1');
      expect(result?.invitedByUserId).toBe('user-1');
      expect(result?.invitedByUserName).toBe('Test User');
      expect(result?.acceptedByUserId).toBe('user-2');
      expect(result?.linkedMemberProfileId).toBe('profile-1');
    });

    it('toPublicModel maps all InvitationPublicModel fields', async () => {
      mockRepo.findByToken.mockResolvedValue(createMockInvitation());

      const result = await service.getInvitationByToken('mock-token');

      expect(result.householdName).toBe('Test Household');
      expect(result.inviterName).toBe('Test User');
      expect(result.role).toBe('ADULT');
      expect(result.relation).toBe('Spouse');
      expect(result.status).toBe('PENDING');
      expect(result.expiresAt).toEqual(new Date('2030-01-01'));
    });

    it('toMemberModel maps all HouseholdMemberModel fields', async () => {
      mockRepo.findByToken.mockResolvedValue(createMockInvitation());
      mockRepo.findMemberByUserId.mockResolvedValue(null);
      mockRepo.countMembersByHousehold.mockResolvedValue(0);
      mockRepo.createMember.mockResolvedValue(
        createMockMember({
          id: 'm-new',
          userId: 'user-2',
          role: 'ADULT',
          color: '#FF6B6B',
          joinedAt: new Date('2024-03-01'),
          user: { name: 'New User', email: 'new@example.com' },
        }),
      );
      mockRepo.updateStatus.mockResolvedValue(createMockInvitation({ status: 'ACCEPTED' }));

      const result = await service.acceptInvitation('user-2', { token: 'mock-token' });

      expect(result.id).toBe('m-new');
      expect(result.role).toBe('ADULT');
      expect(result.color).toBe('#FF6B6B');
      expect(result.joinedAt).toEqual(new Date('2024-03-01'));
      expect(result.userId).toBe('user-2');
      expect(result.userName).toBe('New User');
      expect(result.userEmail).toBe('new@example.com');
      expect(result.householdId).toBe('hh-1');
    });
  });
});
