import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsString, IsOptional } from 'class-validator';

@InputType()
export class ProposeRescheduleInput {
  @IsInt()
  @Field(() => Int)
  bookingId: number;

  @IsString()
  @Field()
  proposedStart: string; // ISO-8601

  @IsString()
  @Field()
  proposedEnd: string; // ISO-8601

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  timezone?: string;
}
