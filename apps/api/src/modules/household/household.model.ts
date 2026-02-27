import { ObjectType, Field, Int, ID, registerEnumType } from '@nestjs/graphql';
import { HouseholdRole, CircleType } from '@family-hub/shared';

registerEnumType(HouseholdRole, { name: 'HouseholdRole' });
registerEnumType(CircleType, { name: 'CircleType' });

@ObjectType('HouseholdMember')
export class HouseholdMemberModel {
  @Field(() => ID)
  id!: string;

  @Field(() => HouseholdRole)
  role!: HouseholdRole;

  @Field()
  color!: string;

  @Field()
  joinedAt!: Date;

  @Field(() => ID)
  userId!: string;

  @Field(() => String, { nullable: true })
  userName?: string | null;

  @Field(() => String, { nullable: true })
  userEmail?: string | null;
}

@ObjectType('Household')
export class HouseholdModel {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field(() => Int)
  membersCount!: number;

  @Field()
  createdAt!: Date;

  @Field(() => [HouseholdMemberModel])
  members!: HouseholdMemberModel[];
}
