import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class VerifyEmailChangeResponse {
  @Field()
  message!: string;
}
