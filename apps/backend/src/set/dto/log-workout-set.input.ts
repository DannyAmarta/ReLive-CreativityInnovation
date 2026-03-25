import { Field, Float, InputType } from '@nestjs/graphql';
import {
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

@InputType()
export class LogWorkoutSetInput {
  @Field()
  @IsString()
  @MinLength(1)
  exerciseId: string;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.5)
  @Max(1000)
  weightKg?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  reps?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(6)
  rir?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0.25)
  @Max(240)
  durationMinutes?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  distanceMeters?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rpe?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}
