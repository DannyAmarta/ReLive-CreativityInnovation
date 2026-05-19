import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class TrainerAvailabilityModel {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  trainerId: number;

  @Field(() => Int, { nullable: true })
  dayOfWeek?: number;

  @Field({ nullable: true })
  specificDate?: Date;

  @Field()
  startTime: string;

  @Field()
  endTime: string;

  @Field()
  isAvailable: boolean;

  @Field({ nullable: true })
  title?: string;

  @Field()
  timezone: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class AvailableSlot {
  @Field()
  start: Date;

  @Field()
  end: Date;

  @Field()
  label: string; // e.g. "09:00 – 10:00"
}
