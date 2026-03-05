import { Resolver, Query, Mutation, Subscription, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Session, AllowAnonymous, type UserSession } from '@thallesp/nestjs-better-auth';
import { PubSubService } from '../../common/pubsub';
import { HouseholdGuard } from '../../common/guards/household.guard';
import { CurrentHousehold } from '../../common/decorators/current-household.decorator';
import { InvitationModel, InvitationPublicModel } from './invitation.model';
import { CreateInvitationInput, AcceptInvitationInput } from './invitation.dto';
import { HouseholdMemberModel } from './household.model';
import { InvitationService } from './invitation.service';
import { InvitationTopics } from './invitation.topics';

@Resolver(() => InvitationModel)
export class InvitationResolver {
  constructor(
    private readonly invitationService: InvitationService,
    private readonly pubSubService: PubSubService,
  ) {}

  @UseGuards(HouseholdGuard)
  @Mutation(() => InvitationModel)
  async createInvitation(
    @Session() session: UserSession,
    @CurrentHousehold() householdId: string,
    @Args('input') input: CreateInvitationInput,
  ): Promise<InvitationModel> {
    return this.invitationService.createInvitation(session.user.id, householdId, input);
  }

  @Mutation(() => HouseholdMemberModel)
  async acceptInvitation(
    @Session() session: UserSession,
    @Args('input') input: AcceptInvitationInput,
  ): Promise<HouseholdMemberModel> {
    return this.invitationService.acceptInvitation(session.user.id, input);
  }

  @UseGuards(HouseholdGuard)
  @Mutation(() => InvitationModel)
  async cancelInvitation(
    @Session() session: UserSession,
    @CurrentHousehold() householdId: string,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<InvitationModel> {
    return this.invitationService.cancelInvitation(session.user.id, householdId, id);
  }

  @AllowAnonymous()
  @Query(() => InvitationPublicModel)
  async invitationByToken(@Args('token') token: string): Promise<InvitationPublicModel> {
    return this.invitationService.getInvitationByToken(token);
  }

  @UseGuards(HouseholdGuard)
  @Query(() => [InvitationModel])
  async householdInvitations(@CurrentHousehold() householdId: string): Promise<InvitationModel[]> {
    return this.invitationService.listInvitations(householdId);
  }

  @Subscription(() => InvitationModel, {
    filter: (
      payload: { invitationAccepted: InvitationModel },
      variables: { householdId: string },
    ) => payload.invitationAccepted.householdId === variables.householdId,
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  invitationAccepted(@Args('householdId', { type: () => ID }) _householdId: string) {
    return this.pubSubService.asyncIterableIterator(InvitationTopics.ACCEPTED);
  }
}
