import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateTrainerProfileInput {
  @Field({ nullable: true })
  bio?: string;

  @Field(() => [String], { nullable: true })
  certifications?: string[];
}
