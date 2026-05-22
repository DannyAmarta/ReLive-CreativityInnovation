import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString } from 'class-validator';

@InputType()
export class RequestCancellationInput {
  @IsInt()
  @Field(() => Int)
  bookingId: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  reason?: string;
}
