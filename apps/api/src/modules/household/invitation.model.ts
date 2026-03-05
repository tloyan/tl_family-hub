import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { InvitationStatus, HouseholdRole } from '@family-hub/shared';

registerEnumType(InvitationStatus, { name: 'InvitationStatus' });

@ObjectType('MemberPreview')
export class MemberPreviewModel {
  @Field(() => ID)
  id!: string;

  @Field()
  color!: string;

  @Field(() => HouseholdRole)
  role!: HouseholdRole;
}

@ObjectType('Invitation')
export class InvitationModel {
  @Field(() => ID)
  id!: string;

  @Field()
  token!: string;

  @Field(() => HouseholdRole)
  role!: HouseholdRole;

  @Field()
  relation!: string;

  @Field(() => InvitationStatus)
  status!: InvitationStatus;

  @Field(() => String, { nullable: true })
  email?: string | null;

  @Field()
  expiresAt!: Date;

  @Field(() => Date, { nullable: true })
  acceptedAt?: Date | null;

  @Field()
  createdAt!: Date;

  @Field(() => ID)
  householdId!: string;

  @Field(() => ID)
  invitedByUserId!: string;

  @Field(() => String, { nullable: true })
  invitedByUserName?: string | null;

  @Field(() => ID, { nullable: true })
  acceptedByUserId?: string | null;

  @Field(() => ID, { nullable: true })
  linkedMemberProfileId?: string | null;
}

@ObjectType('InvitationPublic')
export class InvitationPublicModel {
  @Field()
  householdName!: string;

  @Field()
  inviterName!: string;

  @Field(() => HouseholdRole)
  role!: HouseholdRole;

  @Field()
  relation!: string;

  @Field(() => InvitationStatus)
  status!: InvitationStatus;

  @Field()
  expiresAt!: Date;

  @Field(() => MemberPreviewModel, { nullable: true })
  linkedMemberProfile?: MemberPreviewModel | null;
}
