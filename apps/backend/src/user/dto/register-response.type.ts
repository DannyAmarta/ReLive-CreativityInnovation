import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class RegisterResponse {
  @Field()
  message: string;
}