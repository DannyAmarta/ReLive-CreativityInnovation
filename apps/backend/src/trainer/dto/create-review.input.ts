import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateReviewInput {
  @Field(() => Int)
  bookingId: number;

  @Field(() => Int)
  rating: number; // 1 to 5

  @Field({ nullable: true })
  comment?: string;

  @Field({ nullable: true, defaultValue: false })
  isAnonymous?: boolean;
}
