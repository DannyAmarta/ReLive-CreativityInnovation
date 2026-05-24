import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ConfirmAccountDeletionResponse {
  @Field()
  success!: boolean;

  @Field()
  message!: string;
}
