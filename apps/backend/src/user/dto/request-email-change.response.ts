import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RequestEmailChangeResponse {
  @Field()
  status!: string; // 'VERIFICATION_SENT' | 'ALTERNATE_ACCOUNT_EXISTS'

  @Field({ nullable: true })
  message?: string;
}
