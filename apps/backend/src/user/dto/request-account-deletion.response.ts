import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RequestAccountDeletionResponse {
  @Field()
  success!: boolean;

  @Field()
  verifyToken!: string;

  @Field()
  message!: string;
}
