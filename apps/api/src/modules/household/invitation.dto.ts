import { InputType, Field, ID } from '@nestjs/graphql';
import { HouseholdRole } from '@family-hub/shared';

@InputType()
export class CreateInvitationInput {
  @Field(() => HouseholdRole)
  role!: HouseholdRole;

  @Field()
  relation!: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => ID, { nullable: true })
  linkedMemberProfileId?: string;
}

@InputType()
export class AcceptInvitationInput {
  @Field()
  token!: string;
}
