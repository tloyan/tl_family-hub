import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import type { CircleType, HouseholdRole } from '@family-hub/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HouseholdRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    id: string;
    name: string;
    ownerId: string;
    ownerColor: string;
    circles: CircleType[];
  }) {
    return this.prisma.household.create({
      data: {
        id: data.id,
        name: data.name,
        circles: {
          createMany: {
            data: data.circles.map((type) => ({ id: uuidv7(), type })),
          },
        },
        members: {
          create: {
            id: uuidv7(),
            userId: data.ownerId,
            role: 'OWNER',
            color: data.ownerColor,
          },
        },
      },
      include: { members: { include: { user: true } } },
    });
  }

  async findById(id: string) {
    return this.prisma.household.findUnique({
      where: { id },
      include: { members: { include: { user: true } } },
    });
  }

  async findByUserId(userId: string) {
    const member = await this.prisma.householdMember.findFirst({
      where: { userId },
      include: {
        household: {
          include: { members: { include: { user: true } } },
        },
      },
    });
    return member?.household ?? null;
  }

  async update(id: string, data: { name: string }) {
    return this.prisma.household.update({
      where: { id },
      data: { name: data.name },
      include: { members: { include: { user: true } } },
    });
  }

  async delete(id: string) {
    return this.prisma.household.delete({ where: { id } });
  }

  async countMembersByHouseholdId(householdId: string): Promise<number> {
    return this.prisma.householdMember.count({
      where: { householdId },
    });
  }

  async createMemberProfile(data: {
    id: string;
    displayName: string;
    role: HouseholdRole;
    relation: string;
    color: string;
    householdId: string;
  }) {
    return this.prisma.householdMember.create({
      data: {
        id: data.id,
        displayName: data.displayName,
        role: data.role,
        relation: data.relation,
        color: data.color,
        householdId: data.householdId,
      },
      include: { user: true },
    });
  }

  async findMemberById(id: string) {
    return this.prisma.householdMember.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async updateMemberProfile(id: string, data: { displayName: string }) {
    return this.prisma.householdMember.update({
      where: { id },
      data: { displayName: data.displayName },
      include: { user: true },
    });
  }
}
