import { InputType, Field, ID } from '@nestjs/graphql';
import { HouseholdRole } from '@family-hub/shared';

@InputType()
export class CreateHouseholdInput {
  @Field()
  name!: string;
}

@InputType()
export class UpdateHouseholdInput {
  @Field()
  name!: string;
}

@InputType()
export class CreateMemberProfileInput {
  @Field()
  displayName!: string;

  @Field(() => HouseholdRole)
  role!: HouseholdRole;

  @Field()
  relation!: string;
}

@InputType()
export class UpdateMemberProfileInput {
  @Field(() => ID)
  id!: string;

  @Field()
  displayName!: string;
}
