import { Resolver, Query, Mutation, Subscription, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { PubSubService } from '../../common/pubsub';
import { HouseholdModel, HouseholdMemberModel } from './household.model';
import { CreateHouseholdInput, UpdateHouseholdInput } from './household.dto';
import { HouseholdService } from './household.service';
import { HouseholdGuard } from '../../common/guards/household.guard';
import { CurrentHousehold } from '../../common/decorators/current-household.decorator';
import { HouseholdAccessDeniedException } from '../../common/exceptions/household.exception';
import { HouseholdTopics } from './household.topics';

@Resolver(() => HouseholdModel)
export class HouseholdResolver {
  constructor(
    private readonly householdService: HouseholdService,
    private readonly pubSubService: PubSubService,
  ) {}

  @Mutation(() => HouseholdModel)
  async createHousehold(
    @Session() session: UserSession,
    @Args('input') input: CreateHouseholdInput,
  ): Promise<HouseholdModel> {
    return this.householdService.create(session.user.id, input);
  }

  @Query(() => HouseholdModel, { nullable: true })
  async myHousehold(@Session() session: UserSession): Promise<HouseholdModel | null> {
    return this.householdService.findMyHousehold(session.user.id);
  }

  @Mutation(() => HouseholdModel)
  async updateHousehold(
    @Session() session: UserSession,
    @Args('input') input: UpdateHouseholdInput,
  ): Promise<HouseholdModel> {
    return this.householdService.update(session.user.id, input);
  }

  @Mutation(() => Boolean)
  async deleteHousehold(@Session() session: UserSession): Promise<boolean> {
    return this.householdService.delete(session.user.id);
  }

  @UseGuards(HouseholdGuard)
  @Query(() => HouseholdModel)
  async household(
    @Args('id', { type: () => ID }) id: string,
    @CurrentHousehold() householdId: string,
  ): Promise<HouseholdModel> {
    if (id !== householdId) {
      throw new HouseholdAccessDeniedException();
    }
    return this.householdService.findById(id);
  }

  @Subscription(() => HouseholdMemberModel, {
    filter: (
      payload: { householdMemberChanged: HouseholdMemberModel },
      variables: { householdId: string },
    ) => payload.householdMemberChanged.householdId === variables.householdId,
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  householdMemberChanged(@Args('householdId', { type: () => ID }) _householdId: string) {
    return this.pubSubService.asyncIterableIterator(HouseholdTopics.MEMBER_CHANGED);
  }
}
