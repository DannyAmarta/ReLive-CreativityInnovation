import { Field, InputType, Int } from '@nestjs/graphql';
import { IsDateString, IsIn, IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateBookingInput {
  @IsInt()
  @Field(() => Int)
  trainerId: number;

  @IsInt()
  @Field(() => Int)
  serviceId: number;

  @IsDateString()
  @Field()
  scheduledStart: string;

  @IsDateString()
  @Field()
  scheduledEnd: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  timezone?: string;

  @IsOptional()
  @IsIn(['CRYPTO', 'FIAT'])
  @Field({ nullable: true })
  paymentType?: string;
}
