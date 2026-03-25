import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { SetExerciseCategory, SetFormulaId } from '../set.types';
import { SetRecommendedLoad } from './set-recommended-load.entity';

@ObjectType()
export class SetCalculationResult {
  @Field()
  exerciseId: string;

  @Field()
  exerciseName: string;

  @Field(() => SetExerciseCategory)
  category: SetExerciseCategory;

  @Field(() => SetFormulaId)
  formulaUsed: SetFormulaId;

  @Field(() => Int, { nullable: true })
  actualReps: number | null;

  @Field(() => Int, { nullable: true })
  rir: number | null;

  @Field(() => Int, { nullable: true })
  effectiveReps: number | null;

  @Field(() => Int, { nullable: true })
  boundedEffectiveReps: number | null;

  @Field()
  boundedByRepCap: boolean;

  @Field(() => Int, { nullable: true })
  repCap: number | null;

  @Field(() => Float, { nullable: true })
  weightKg: number | null;

  @Field(() => Float, { nullable: true })
  estimatedOneRepMaxKg: number | null;

  @Field(() => Float, { nullable: true })
  trainingMaxKg: number | null;

  @Field(() => Float, { nullable: true })
  relativeIntensityPercent: number | null;

  @Field(() => Float, { nullable: true })
  volumeLoadKg: number | null;

  @Field(() => Float, { nullable: true })
  durationMinutes: number | null;

  @Field(() => Float, { nullable: true })
  distanceMeters: number | null;

  @Field(() => Float, { nullable: true })
  pacePerKilometerMinutes: number | null;

  @Field(() => Float, { nullable: true })
  cardioLoadScore: number | null;

  @Field(() => Float, { nullable: true })
  estimatedCalories: number | null;

  @Field(() => Float)
  confidenceScore: number;

  @Field()
  primaryEnergySystem: string;

  @Field()
  insightSummary: string;

  @Field(() => [String])
  warnings: string[];

  @Field(() => [SetRecommendedLoad])
  recommendedLoads: SetRecommendedLoad[];
}
