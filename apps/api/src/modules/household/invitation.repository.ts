import { Injectable } from '@nestjs/common';
import type { HouseholdRole, InvitationStatus } from '@family-hub/shared';
import { PrismaService } from '../prisma/prisma.service';

const includeRelations = {
  invitedBy: { select: { name: true, email: true } },
  acceptedBy: { select: { name: true, email: true } },
  household: { select: { name: true } },
  linkedMemberProfile: { select: { id: true, color: true, role: true } },
};

@Injectable()
export class InvitationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    id: string;
    token: string;
    role: HouseholdRole;
    relation: string;
    status: InvitationStatus;
    email?: string;
    expiresAt: Date;
    householdId: string;
    invitedByUserId: string;
    linkedMemberProfileId?: string;
  }) {
    return this.prisma.invitation.create({
      data,
      include: includeRelations,
    });
  }

  async findByToken(token: string) {
    return this.prisma.bypassHouseholdFilter().invitation.findUnique({
      where: { token },
      include: includeRelations,
    });
  }

  async findByHousehold(householdId: string) {
    return this.prisma.invitation.findMany({
      where: { householdId },
      orderBy: { createdAt: 'desc' },
      include: includeRelations,
    });
  }

  async findById(id: string) {
    return this.prisma.invitation.findUnique({
      where: { id },
      include: includeRelations,
    });
  }

  async updateStatus(
    id: string,
    data: { status: InvitationStatus; acceptedAt?: Date; acceptedByUserId?: string },
  ) {
    return this.prisma.bypassHouseholdFilter().invitation.update({
      where: { id },
      data,
      include: includeRelations,
    });
  }

  async countPendingByHousehold(householdId: string): Promise<number> {
    return this.prisma.bypassHouseholdFilter().invitation.count({
      where: { householdId, status: 'PENDING' },
    });
  }

  async countMembersByHousehold(householdId: string): Promise<number> {
    return this.prisma.bypassHouseholdFilter().householdMember.count({
      where: { householdId },
    });
  }

  async findMemberByUserId(userId: string, householdId: string) {
    return this.prisma.bypassHouseholdFilter().householdMember.findFirst({
      where: { userId, householdId },
    });
  }

  async createMember(data: {
    id: string;
    role: HouseholdRole;
    color: string;
    userId: string;
    householdId: string;
  }) {
    return this.prisma.bypassHouseholdFilter().householdMember.create({
      data,
      include: { user: { select: { name: true, email: true } } },
    });
  }

  async linkMemberToUser(memberId: string, userId: string) {
    return this.prisma.bypassHouseholdFilter().householdMember.update({
      where: { id: memberId },
      data: { userId },
      include: { user: { select: { name: true, email: true } } },
    });
  }
}
