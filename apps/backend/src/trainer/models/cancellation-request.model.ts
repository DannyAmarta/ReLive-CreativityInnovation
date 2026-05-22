import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CancellationRequest {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  bookingId: number;

  @Field(() => Int)
  proposedById: number;

  @Field({ nullable: true })
  reason?: string;

  @Field()
  status: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
