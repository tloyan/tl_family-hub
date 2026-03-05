import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { InvitationResolver } from '../invitation.resolver';
import { InvitationService } from '../invitation.service';
import type { PubSubService } from '../../../common/pubsub';
import type { CreateInvitationInput, AcceptInvitationInput } from '../invitation.dto';

const mockService = {
  createInvitation: vi.fn(),
  acceptInvitation: vi.fn(),
  cancelInvitation: vi.fn(),
  listInvitations: vi.fn(),
  getInvitationByToken: vi.fn(),
};

const mockPubSub = {
  publish: vi.fn().mockResolvedValue(undefined),
  asyncIterableIterator: vi.fn(),
};

describe('InvitationResolver', () => {
  let resolver: InvitationResolver;
  const session = { user: { id: 'user-1' } } as UserSession;

  beforeEach(() => {
    vi.clearAllMocks();
    resolver = new InvitationResolver(
      mockService as unknown as InvitationService,
      mockPubSub as unknown as PubSubService,
    );
  });

  describe('createInvitation', () => {
    it('delegates to service with session.user.id, householdId, and input', async () => {
      const input: CreateInvitationInput = { role: 'ADULT' as never, relation: 'Spouse' };
      const expected = { id: 'inv-1' };
      mockService.createInvitation.mockResolvedValue(expected);

      const result = await resolver.createInvitation(session, 'hh-1', input);

      expect(mockService.createInvitation).toHaveBeenCalledWith('user-1', 'hh-1', input);
      expect(result).toBe(expected);
    });
  });

  describe('acceptInvitation', () => {
    it('delegates to service with session.user.id and input', async () => {
      const input: AcceptInvitationInput = { token: 'mock-token' };
      const expected = { id: 'm-1' };
      mockService.acceptInvitation.mockResolvedValue(expected);

      const result = await resolver.acceptInvitation(session, input);

      expect(mockService.acceptInvitation).toHaveBeenCalledWith('user-1', input);
      expect(result).toBe(expected);
    });
  });

  describe('cancelInvitation', () => {
    it('delegates to service with session.user.id, householdId, and id', async () => {
      const expected = { id: 'inv-1', status: 'CANCELLED' };
      mockService.cancelInvitation.mockResolvedValue(expected);

      const result = await resolver.cancelInvitation(session, 'hh-1', 'inv-1');

      expect(mockService.cancelInvitation).toHaveBeenCalledWith('user-1', 'hh-1', 'inv-1');
      expect(result).toBe(expected);
    });
  });

  describe('invitationByToken', () => {
    it('delegates to service with token', async () => {
      const expected = { householdName: 'Test', status: 'PENDING' };
      mockService.getInvitationByToken.mockResolvedValue(expected);

      const result = await resolver.invitationByToken('mock-token');

      expect(mockService.getInvitationByToken).toHaveBeenCalledWith('mock-token');
      expect(result).toBe(expected);
    });
  });

  describe('householdInvitations', () => {
    it('delegates to service with householdId', async () => {
      const expected = [{ id: 'inv-1' }];
      mockService.listInvitations.mockResolvedValue(expected);

      const result = await resolver.householdInvitations('hh-1');

      expect(mockService.listInvitations).toHaveBeenCalledWith('hh-1');
      expect(result).toBe(expected);
    });
  });

  describe('invitationAccepted subscription', () => {
    it('calls pubSubService.asyncIterableIterator with invitation.accepted topic', () => {
      const mockIterator = { next: vi.fn() };
      mockPubSub.asyncIterableIterator.mockReturnValue(mockIterator);

      const result = resolver.invitationAccepted('hh-1');

      expect(mockPubSub.asyncIterableIterator).toHaveBeenCalledWith('invitation.accepted');
      expect(result).toBe(mockIterator);
    });

    it('subscription filter matches correct householdId', () => {
      // NestJS SetMetadata stores on the method descriptor, key includes trailing semicolon
      const metadataKey = 'graphql:subscription_options;';
      const metadata = Reflect.getMetadata(
        metadataKey,
        InvitationResolver.prototype.invitationAccepted,
      ) as
        | {
            filter?: (
              payload: { invitationAccepted: { householdId: string } },
              variables: { householdId: string },
            ) => boolean;
          }
        | undefined;

      expect(metadata).toBeDefined();
      expect(metadata?.filter).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const filter = metadata!.filter!;

      expect(filter({ invitationAccepted: { householdId: 'hh-1' } }, { householdId: 'hh-1' })).toBe(
        true,
      );
      expect(filter({ invitationAccepted: { householdId: 'hh-1' } }, { householdId: 'hh-2' })).toBe(
        false,
      );
    });
  });
});
