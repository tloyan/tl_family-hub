import { Injectable, Logger } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import {
  CircleType,
  HouseholdRole,
  createHouseholdInput,
  updateHouseholdInput,
  createMemberProfileInput,
  updateMemberProfileInput,
  getNextColor,
  MAX_MEMBERS_PER_HOUSEHOLD,
} from '@family-hub/shared';
import {
  HouseholdNotFoundException,
  HouseholdAlreadyExistsException,
  HouseholdNameInvalidException,
  MemberNotFoundException,
  NotHouseholdOwnerException,
} from '../../common/exceptions/household.exception';
import { InvitationLimitReachedException } from '../../common/exceptions/invitation.exception';
import { PubSubService } from '../../common/pubsub';
import { HouseholdRepository } from './household.repository';
import { HouseholdModel, HouseholdMemberModel } from './household.model';
import { HouseholdTopics } from './household.topics';
import type { CreateHouseholdInput, UpdateHouseholdInput } from './household.dto';

@Injectable()
export class HouseholdService {
  private readonly logger = new Logger(HouseholdService.name);

  constructor(
    private readonly householdRepository: HouseholdRepository,
    private readonly pubSubService: PubSubService,
  ) {}

  async create(userId: string, input: CreateHouseholdInput): Promise<HouseholdModel> {
    const result = createHouseholdInput.safeParse({ name: input.name });
    if (!result.success) {
      throw new HouseholdNameInvalidException();
    }
    const parsed = result.data;

    const existing = await this.householdRepository.findByUserId(userId);
    if (existing) {
      throw new HouseholdAlreadyExistsException();
    }

    const household = await this.householdRepository.create({
      id: uuidv7(),
      name: parsed.name,
      ownerId: userId,
      ownerColor: getNextColor(0),
      circles: Object.values(CircleType),
    });

    const model = this.toModel(household);
    const ownerMember = model.members[0];
    if (ownerMember) {
      await this.pubSubService.publish(HouseholdTopics.MEMBER_CHANGED, {
        householdMemberChanged: ownerMember,
      });
    }

    this.logger.log('Household created', { householdId: household.id, userId });
    return model;
  }

  async findMyHousehold(userId: string): Promise<HouseholdModel | null> {
    const household = await this.householdRepository.findByUserId(userId);
    if (!household) {
      return null;
    }
    return this.toModel(household);
  }

  async update(userId: string, input: UpdateHouseholdInput): Promise<HouseholdModel> {
    const result = updateHouseholdInput.safeParse({ name: input.name });
    if (!result.success) {
      throw new HouseholdNameInvalidException();
    }
    const parsed = result.data;

    const household = await this.householdRepository.findByUserId(userId);
    if (!household) {
      throw new HouseholdNotFoundException();
    }

    const member = household.members.find((m) => m.userId === userId);
    if (member?.role !== HouseholdRole.OWNER) {
      this.logger.warn('Non-owner attempted household update', {
        userId,
        householdId: household.id,
      });
      throw new NotHouseholdOwnerException();
    }

    const updated = await this.householdRepository.update(household.id, { name: parsed.name });
    this.logger.log('Household updated', { householdId: household.id, userId });
    return this.toModel(updated);
  }

  async delete(userId: string): Promise<boolean> {
    const household = await this.householdRepository.findByUserId(userId);
    if (!household) {
      throw new HouseholdNotFoundException();
    }

    const member = household.members.find((m) => m.userId === userId);
    if (member?.role !== HouseholdRole.OWNER) {
      this.logger.warn('Non-owner attempted household deletion', {
        userId,
        householdId: household.id,
      });
      throw new NotHouseholdOwnerException();
    }

    await this.householdRepository.delete(household.id);
    this.logger.log('Household deleted', { householdId: household.id, userId });
    return true;
  }

  async findById(id: string): Promise<HouseholdModel> {
    const household = await this.householdRepository.findById(id);
    if (!household) {
      throw new HouseholdNotFoundException();
    }
    return this.toModel(household);
  }

  async createMemberProfile(
    userId: string,
    householdId: string,
    input: { displayName: string; role: string; relation: string },
  ): Promise<HouseholdMemberModel> {
    const result = createMemberProfileInput.safeParse(input);
    if (!result.success) {
      throw new HouseholdNameInvalidException();
    }

    const household = await this.householdRepository.findById(householdId);
    if (!household) {
      throw new HouseholdNotFoundException();
    }

    const member = household.members.find((m) => m.userId === userId);
    if (!member || (member.role !== HouseholdRole.OWNER && member.role !== HouseholdRole.ADMIN)) {
      throw new NotHouseholdOwnerException();
    }

    const membersCount = await this.householdRepository.countMembersByHouseholdId(householdId);
    if (membersCount >= MAX_MEMBERS_PER_HOUSEHOLD) {
      throw new InvitationLimitReachedException();
    }

    const color = getNextColor(membersCount);
    const created = await this.householdRepository.createMemberProfile({
      id: uuidv7(),
      displayName: result.data.displayName,
      role: result.data.role,
      relation: result.data.relation,
      color,
      householdId,
    });

    const memberModel = this.toMemberModel(created, householdId);

    await this.pubSubService.publish(HouseholdTopics.MEMBER_CHANGED, {
      householdMemberChanged: memberModel,
    });

    this.logger.log('Member profile created', { memberId: created.id, householdId });
    return memberModel;
  }

  async updateMemberProfile(
    userId: string,
    householdId: string,
    input: { id: string; displayName: string },
  ): Promise<HouseholdMemberModel> {
    const result = updateMemberProfileInput.safeParse(input);
    if (!result.success) {
      throw new HouseholdNameInvalidException();
    }

    const target = await this.householdRepository.findMemberById(result.data.id);
    if (!target || target.householdId !== householdId) {
      throw new MemberNotFoundException();
    }

    const household = await this.householdRepository.findById(householdId);
    if (!household) {
      throw new HouseholdNotFoundException();
    }

    const caller = household.members.find((m) => m.userId === userId);
    const isSelfEdit = target.userId === userId;
    const isAdminOrOwner =
      caller?.role === HouseholdRole.OWNER || caller?.role === HouseholdRole.ADMIN;

    if (!isSelfEdit && !isAdminOrOwner) {
      throw new NotHouseholdOwnerException();
    }

    const updated = await this.householdRepository.updateMemberProfile(result.data.id, {
      displayName: result.data.displayName,
    });

    const memberModel = this.toMemberModel(updated, householdId);

    await this.pubSubService.publish(HouseholdTopics.MEMBER_CHANGED, {
      householdMemberChanged: memberModel,
    });

    this.logger.log('Member profile updated', { memberId: updated.id, householdId });
    return memberModel;
  }

  private toMemberModel(
    member: {
      id: string;
      role: string;
      color: string;
      displayName: string | null;
      relation: string | null;
      joinedAt: Date;
      userId: string | null;
      user: { name: string; email: string } | null;
    },
    householdId: string,
  ): HouseholdMemberModel {
    const m = new HouseholdMemberModel();
    m.id = member.id;
    m.role = member.role as HouseholdMemberModel['role'];
    m.color = member.color;
    m.displayName = member.displayName;
    m.relation = member.relation;
    m.joinedAt = member.joinedAt;
    m.userId = member.userId;
    m.householdId = householdId;
    m.userName = member.user?.name ?? null;
    m.userEmail = member.user?.email ?? null;
    return m;
  }

  private toModel(household: {
    id: string;
    name: string;
    createdAt: Date;
    members: {
      id: string;
      role: string;
      color: string;
      displayName: string | null;
      relation: string | null;
      joinedAt: Date;
      userId: string | null;
      user: { name: string; email: string } | null;
    }[];
  }): HouseholdModel {
    const model = new HouseholdModel();
    model.id = household.id;
    model.name = household.name;
    model.createdAt = household.createdAt;
    model.membersCount = household.members.length;
    model.members = household.members.map((member) => this.toMemberModel(member, household.id));
    return model;
  }
}
