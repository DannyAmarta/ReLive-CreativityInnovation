import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OpenRouterConnectionPayload {
  @Field()
  success!: boolean;

  @Field(() => String)
  message!: string;

  @Field()
  hasConnection!: boolean;

  @Field(() => String, { nullable: true })
  keyLabel?: string | null;

  @Field(() => Date, { nullable: true })
  connectedAt?: Date | null;
}
