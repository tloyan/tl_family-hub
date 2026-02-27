import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateHouseholdInput {
  @Field()
  name!: string;
}
