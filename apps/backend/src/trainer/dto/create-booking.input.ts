import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt } from 'class-validator';

@InputType()
export class CreateBookingInput {
  @IsInt()
  @Field(() => Int)
  trainerId: number;

  @IsInt()
  @Field(() => Int)
  serviceId: number;

}
