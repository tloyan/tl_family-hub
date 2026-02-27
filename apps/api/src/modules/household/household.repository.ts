import { Injectable } from '@nestjs/common';
import { v7 as uuidv7 } from 'uuid';
import type { CircleType } from '@family-hub/shared';
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

  async countMembersByHouseholdId(householdId: string): Promise<number> {
    return this.prisma.householdMember.count({
      where: { householdId },
    });
  }
}
