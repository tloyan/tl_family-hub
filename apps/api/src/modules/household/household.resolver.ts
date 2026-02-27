import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { Session, type UserSession } from '@thallesp/nestjs-better-auth';
import { HouseholdModel } from './household.model';
import { CreateHouseholdInput } from './household.dto';
import { HouseholdService } from './household.service';

@Resolver(() => HouseholdModel)
export class HouseholdResolver {
  constructor(private readonly householdService: HouseholdService) {}

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

  @Query(() => HouseholdModel)
  async household(@Args('id', { type: () => ID }) id: string): Promise<HouseholdModel> {
    return this.householdService.findById(id);
  }
}
