import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString, IsBoolean, IsOptional, Min, Max } from 'class-validator';

@InputType()
export class CreateReviewInput {
  @IsInt()
  @Field(() => Int)
  bookingId: number;

  @IsInt()
  @Min(1)
  @Max(5)
  @Field(() => Int)
  rating: number; // 1 to 5

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  comment?: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true, defaultValue: false })
  isAnonymous?: boolean;
}
