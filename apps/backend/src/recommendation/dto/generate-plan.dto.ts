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

export class GeneratePlanDto {
  @IsString()
  @MinLength(1)
  exerciseId: string;

  @IsEnum(RecommendationPhaseGoal)
  phaseGoal: RecommendationPhaseGoal;

  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(28)
  days?: number = 14;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  trainingDaysPerWeek?: number = 3;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  targetSets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(15)
  targetReps?: number;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  notes?: string;
}
