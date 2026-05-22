import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RescheduleRequest {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  bookingId: number;

  @Field(() => Int)
  proposedById: number;

  @Field({ nullable: true })
  originalStart?: Date;

  @Field({ nullable: true })
  originalEnd?: Date;

  @Field()
  proposedStart: Date;

  @Field()
  proposedEnd: Date;

  @Field()
  timezone: string;

  @Field()
  status: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
