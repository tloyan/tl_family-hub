import { InputType, Field } from '@nestjs/graphql';

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
