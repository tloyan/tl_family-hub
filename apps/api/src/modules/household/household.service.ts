import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import {
  CircleType,
  HouseholdRole,
  createHouseholdInput,
  updateHouseholdInput,
  getNextColor,
} from '@family-hub/shared';
import {
  HouseholdNotFoundException,
  HouseholdAlreadyExistsException,
  NotHouseholdOwnerException,
} from '../../common/exceptions/household.exception';
import { HouseholdRepository } from './household.repository';
import { HouseholdModel, HouseholdMemberModel } from './household.model';
import type { CreateHouseholdInput, UpdateHouseholdInput } from './household.dto';

@Injectable()
export class HouseholdService {
  constructor(private readonly householdRepository: HouseholdRepository) {}

  async create(userId: string, input: CreateHouseholdInput): Promise<HouseholdModel> {
    const parsed = createHouseholdInput.parse({ name: input.name });

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

    return this.toModel(household);
  }

  async findMyHousehold(userId: string): Promise<HouseholdModel | null> {
    const household = await this.householdRepository.findByUserId(userId);
    if (!household) {
      return null;
    }
    return this.toModel(household);
  }

  async update(userId: string, input: UpdateHouseholdInput): Promise<HouseholdModel> {
    const parsed = updateHouseholdInput.parse({ name: input.name });

    const household = await this.householdRepository.findByUserId(userId);
    if (!household) {
      throw new HouseholdNotFoundException();
    }

    const member = household.members.find((m) => m.userId === userId);
    if (member?.role !== HouseholdRole.OWNER) {
      throw new NotHouseholdOwnerException();
    }

    const updated = await this.householdRepository.update(household.id, { name: parsed.name });
    return this.toModel(updated);
  }

  async delete(userId: string): Promise<boolean> {
    const household = await this.householdRepository.findByUserId(userId);
    if (!household) {
      throw new HouseholdNotFoundException();
    }

    const member = household.members.find((m) => m.userId === userId);
    if (member?.role !== HouseholdRole.OWNER) {
      throw new NotHouseholdOwnerException();
    }

    await this.householdRepository.delete(household.id);
    return true;
  }

  async findById(id: string): Promise<HouseholdModel> {
    const household = await this.householdRepository.findById(id);
    if (!household) {
      throw new HouseholdNotFoundException();
    }
    return this.toModel(household);
  }

  private toModel(household: {
    id: string;
    name: string;
    createdAt: Date;
    members: {
      id: string;
      role: string;
      color: string;
      joinedAt: Date;
      userId: string;
      user: { name: string; email: string };
    }[];
  }): HouseholdModel {
    const model = new HouseholdModel();
    model.id = household.id;
    model.name = household.name;
    model.createdAt = household.createdAt;
    model.membersCount = household.members.length;
    model.members = household.members.map((member) => {
      const m = new HouseholdMemberModel();
      m.id = member.id;
      m.role = member.role as HouseholdMemberModel['role'];
      m.color = member.color;
      m.joinedAt = member.joinedAt;
      m.userId = member.userId;
      m.userName = member.user.name;
      m.userEmail = member.user.email;
      return m;
    });
    return model;
  }
}
