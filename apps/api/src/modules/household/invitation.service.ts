import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { v7 as uuidv7 } from 'uuid';
import { Resend } from 'resend';
import {
  HouseholdRole,
  InvitationStatus,
  createInvitationInput,
  acceptInvitationInput,
  getNextColor,
  INVITATION_EXPIRY_DAYS,
  MAX_MEMBERS_PER_HOUSEHOLD,
  MAX_PENDING_INVITATIONS_PER_HOUSEHOLD,
} from '@family-hub/shared';
import { renderInvitationEmail } from '@family-hub/emails';
import { PubSubService } from '../../common/pubsub';
import {
  InvitationNotFoundException,
  InvitationExpiredException,
  InvitationAlreadyAcceptedException,
  InvitationCancelledException,
  InvitationLimitReachedException,
  NotInvitationOwnerException,
  CannotInviteSelfException,
  InvitationInputInvalidException,
} from '../../common/exceptions/invitation.exception';
import { InvitationRepository } from './invitation.repository';
import { InvitationModel, InvitationPublicModel, MemberPreviewModel } from './invitation.model';
import { HouseholdMemberModel } from './household.model';
import { InvitationTopics } from './invitation.topics';
import { HouseholdTopics } from './household.topics';
import type { CreateInvitationInput, AcceptInvitationInput } from './invitation.dto';

@Injectable()
export class InvitationService {
  private readonly logger = new Logger(InvitationService.name);
  private readonly resend = new Resend(process.env['RESEND_API_KEY']);

  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly pubSubService: PubSubService,
  ) {}

  async createInvitation(
    userId: string,
    householdId: string,
    input: CreateInvitationInput,
  ): Promise<InvitationModel> {
    const result = createInvitationInput.safeParse(input);
    if (!result.success) {
      throw new InvitationInputInvalidException();
    }

    const member = await this.invitationRepository.findMemberByUserId(userId, householdId);
    if (!member || (member.role !== HouseholdRole.OWNER && member.role !== HouseholdRole.ADMIN)) {
      throw new NotInvitationOwnerException();
    }

    const [membersCount, pendingCount] = await Promise.all([
      this.invitationRepository.countMembersByHousehold(householdId),
      this.invitationRepository.countPendingByHousehold(householdId),
    ]);

    if (membersCount + pendingCount >= MAX_MEMBERS_PER_HOUSEHOLD) {
      throw new InvitationLimitReachedException();
    }
    if (pendingCount >= MAX_PENDING_INVITATIONS_PER_HOUSEHOLD) {
      throw new InvitationLimitReachedException();
    }

    const token = randomBytes(32).toString('base64url');
    const id = uuidv7();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRY_DAYS);

    const invitation = await this.invitationRepository.create({
      id,
      token,
      role: input.role,
      relation: input.relation,
      status: InvitationStatus.PENDING,
      email: input.email,
      expiresAt,
      householdId,
      invitedByUserId: userId,
      linkedMemberProfileId: input.linkedMemberProfileId,
    });

    if (input.email) {
      try {
        const invitationLink = `${process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:3000'}/invite/${token}`;
        const { html, subject } = renderInvitationEmail({
          inviterName: invitation.invitedBy.name,
          householdName: invitation.household.name,
          relation: input.relation,
          invitationLink,
        });
        await this.resend.emails.send({
          from: `Family Hub <${process.env['EMAIL_FROM']}>`,
          to: input.email,
          subject,
          html,
        });
      } catch (error) {
        this.logger.warn('Failed to send invitation email', { error, email: input.email });
      }
    }

    this.logger.log('Invitation created', { invitationId: id, householdId });
    return this.toModel(invitation);
  }

  async acceptInvitation(
    userId: string,
    input: AcceptInvitationInput,
  ): Promise<HouseholdMemberModel> {
    const result = acceptInvitationInput.safeParse(input);
    if (!result.success) {
      throw new InvitationInputInvalidException();
    }

    const invitation = await this.invitationRepository.findByToken(input.token);
    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    if (invitation.status === InvitationStatus.ACCEPTED) {
      throw new InvitationAlreadyAcceptedException();
    }
    if (invitation.status === InvitationStatus.CANCELLED) {
      throw new InvitationCancelledException();
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new InvitationExpiredException();
    }

    if (new Date() > invitation.expiresAt) {
      await this.invitationRepository.updateStatus(invitation.id, {
        status: InvitationStatus.EXPIRED,
      });
      throw new InvitationExpiredException();
    }

    const existingMember = await this.invitationRepository.findMemberByUserId(
      userId,
      invitation.householdId,
    );
    if (existingMember) {
      throw new CannotInviteSelfException();
    }

    let member: {
      id: string;
      role: string;
      color: string;
      joinedAt: Date;
      userId: string | null;
      user: { name: string; email: string } | null;
      householdId: string;
    };

    if (invitation.linkedMemberProfileId) {
      // Case 2: Link existing member profile to user
      const linked = await this.invitationRepository.linkMemberToUser(
        invitation.linkedMemberProfileId,
        userId,
      );
      member = { ...linked, householdId: invitation.householdId };
    } else {
      // Case 1: Create new member
      const membersCount = await this.invitationRepository.countMembersByHousehold(
        invitation.householdId,
      );
      const color = getNextColor(membersCount);
      const created = await this.invitationRepository.createMember({
        id: uuidv7(),
        role: invitation.role,
        color,
        userId,
        householdId: invitation.householdId,
      });
      member = { ...created, householdId: invitation.householdId };
    }

    await this.invitationRepository.updateStatus(invitation.id, {
      status: InvitationStatus.ACCEPTED,
      acceptedAt: new Date(),
      acceptedByUserId: userId,
    });

    const memberModel = this.toMemberModel(member);

    await this.pubSubService.publish(InvitationTopics.ACCEPTED, {
      invitationAccepted: this.toModel({
        ...invitation,
        status: InvitationStatus.ACCEPTED,
        acceptedByUserId: userId,
      }),
    });
    await this.pubSubService.publish(HouseholdTopics.MEMBER_CHANGED, {
      householdMemberChanged: memberModel,
    });

    this.logger.log('Invitation accepted', {
      invitationId: invitation.id,
      householdId: invitation.householdId,
      userId,
    });
    return memberModel;
  }

  async cancelInvitation(
    userId: string,
    householdId: string,
    invitationId: string,
  ): Promise<InvitationModel> {
    const member = await this.invitationRepository.findMemberByUserId(userId, householdId);
    if (!member || (member.role !== HouseholdRole.OWNER && member.role !== HouseholdRole.ADMIN)) {
      throw new NotInvitationOwnerException();
    }

    const invitation = await this.invitationRepository.findById(invitationId);
    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new InvitationAlreadyAcceptedException();
    }

    const updated = await this.invitationRepository.updateStatus(invitation.id, {
      status: InvitationStatus.CANCELLED,
    });

    this.logger.log('Invitation cancelled', { invitationId, householdId });
    return this.toModel(updated);
  }

  async listInvitations(householdId: string): Promise<InvitationModel[]> {
    const invitations = await this.invitationRepository.findByHousehold(householdId);
    return invitations.map((inv) => this.toModel(inv));
  }

  async getInvitationByToken(token: string): Promise<InvitationPublicModel> {
    const invitation = await this.invitationRepository.findByToken(token);
    if (!invitation) {
      throw new InvitationNotFoundException();
    }

    const inviterMember = await this.invitationRepository.findMemberByUserId(
      invitation.invitedByUserId,
      invitation.householdId,
    );

    if (invitation.status === InvitationStatus.PENDING && new Date() > invitation.expiresAt) {
      await this.invitationRepository.updateStatus(invitation.id, {
        status: InvitationStatus.EXPIRED,
      });
      return this.toPublicModel(
        { ...invitation, status: InvitationStatus.EXPIRED },
        inviterMember?.displayName,
      );
    }

    return this.toPublicModel(invitation, inviterMember?.displayName);
  }

  private toModel(invitation: {
    id: string;
    token: string;
    role: string;
    relation: string;
    status: string;
    email: string | null;
    expiresAt: Date;
    acceptedAt: Date | null;
    createdAt: Date;
    householdId: string;
    invitedByUserId: string;
    invitedBy: { name: string; email: string };
    acceptedByUserId: string | null;
    linkedMemberProfileId: string | null;
  }): InvitationModel {
    const model = new InvitationModel();
    model.id = invitation.id;
    model.token = invitation.token;
    model.role = invitation.role as InvitationModel['role'];
    model.relation = invitation.relation;
    model.status = invitation.status as InvitationModel['status'];
    model.email = invitation.email;
    model.expiresAt = invitation.expiresAt;
    model.acceptedAt = invitation.acceptedAt;
    model.createdAt = invitation.createdAt;
    model.householdId = invitation.householdId;
    model.invitedByUserId = invitation.invitedByUserId;
    model.invitedByUserName = invitation.invitedBy.name;
    model.acceptedByUserId = invitation.acceptedByUserId;
    model.linkedMemberProfileId = invitation.linkedMemberProfileId;
    return model;
  }

  private toPublicModel(
    invitation: {
      role: string;
      relation: string;
      status: string;
      expiresAt: Date;
      household: { name: string };
      invitedBy: { name: string };
      linkedMemberProfile: { id: string; color: string; role: string } | null;
    },
    inviterDisplayName?: string | null,
  ): InvitationPublicModel {
    const model = new InvitationPublicModel();
    model.householdName = invitation.household.name;
    model.inviterName = inviterDisplayName || invitation.invitedBy.name;
    model.role = invitation.role as InvitationPublicModel['role'];
    model.relation = invitation.relation;
    model.status = invitation.status as InvitationPublicModel['status'];
    model.expiresAt = invitation.expiresAt;
    if (invitation.linkedMemberProfile) {
      const preview = new MemberPreviewModel();
      preview.id = invitation.linkedMemberProfile.id;
      preview.color = invitation.linkedMemberProfile.color;
      preview.role = invitation.linkedMemberProfile.role as MemberPreviewModel['role'];
      model.linkedMemberProfile = preview;
    }
    return model;
  }

  private toMemberModel(member: {
    id: string;
    role: string;
    color: string;
    joinedAt: Date;
    userId: string | null;
    user: { name: string; email: string } | null;
    householdId: string;
  }): HouseholdMemberModel {
    const m = new HouseholdMemberModel();
    m.id = member.id;
    m.role = member.role as HouseholdMemberModel['role'];
    m.color = member.color;
    m.joinedAt = member.joinedAt;
    m.userId = member.userId;
    m.userName = member.user?.name ?? null;
    m.userEmail = member.user?.email ?? null;
    m.householdId = member.householdId;
    return m;
  }
}
