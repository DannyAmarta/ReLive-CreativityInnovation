import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export enum RecommendationPhaseGoal {
  BASELINE_TESTING = 'BASELINE_TESTING',
  HYPERTROPHY = 'HYPERTROPHY',
  STRENGTH = 'STRENGTH',
  POWER = 'POWER',
  RECOVERY = 'RECOVERY',
}

registerEnumType(RecommendationPhaseGoal, {
  name: 'RecommendationPhaseGoal',
});

@InputType()
export class GeneratePlanDto {
  @Field()
  @IsString()
  @MinLength(1)
  exerciseId: string;

  @Field(() => RecommendationPhaseGoal)
  @IsEnum(RecommendationPhaseGoal)
  phaseGoal: RecommendationPhaseGoal;

  @Field(() => Int, { nullable: true, defaultValue: 14 })
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(28)
  days?: number = 14;

  @Field(() => Int, { nullable: true, defaultValue: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  trainingDaysPerWeek?: number = 3;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  targetSets?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(15)
  targetReps?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(400)
  notes?: string;
}
