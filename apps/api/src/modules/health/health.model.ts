import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class HealthStatus {
  @Field(() => String)
  status!: string;

  @Field(() => String)
  version!: string;

  @Field(() => String)
  timestamp!: string;
}
