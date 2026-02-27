import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ClsService } from 'nestjs-cls';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import type { AppClsStore } from '../cls/cls.store';
import {
  HouseholdAccessDeniedException,
  HouseholdHeaderMissingException,
} from '../exceptions/household.exception';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class HouseholdGuard implements CanActivate {
  constructor(
    private readonly cls: ClsService<AppClsStore>,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context).getContext<{
      req: { session: UserSession; headers: Record<string, string | undefined> };
    }>();

    const householdId = gqlContext.req.headers['x-household-id'];
    if (!householdId) {
      throw new HouseholdHeaderMissingException();
    }

    const userId = gqlContext.req.session.user.id;

    const member = await this.prisma.bypassHouseholdFilter().householdMember.findFirst({
      where: { userId, householdId },
      select: { householdId: true },
    });

    if (!member) {
      throw new HouseholdAccessDeniedException();
    }

    this.cls.set('householdId', member.householdId);
    return true;
  }
}
