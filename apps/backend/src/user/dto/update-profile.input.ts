import { Field, InputType, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsBoolean, IsInt, Length } from 'class-validator';

@InputType()
export class UpdateProfileInput {
  @IsOptional()
  @IsString()
  @Length(2, 80, { message: 'Name must be between 2 and 80 characters' })
  @Field(() => String, { nullable: true })
  name?: string;

  @IsOptional()
  @IsString()
  @Length(0, 255, { message: 'Bio cannot exceed 255 characters' })
  @Field(() => String, { nullable: true })
  bio?: string;

  // --- New Onboarding Fields ---
  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  profileCompleted?: boolean;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  fitnessLevel?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  dailyActivity?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  primaryGoal?: string;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  vitalityScore?: number;
}