import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SetPerformanceAnalytics {
  @Field()
  exerciseId: string;

  @Field()
  exerciseName: string;

  @Field(() => Int)
  periodDays: number;

  @Field(() => Float, { nullable: true })
  emaOneRepMaxKg: number | null;

  @Field(() => Float, { nullable: true })
  baselineAverageOneRepMaxKg: number | null;

  @Field(() => Float, { nullable: true })
  latestLoggedOneRepMaxKg: number | null;

  @Field(() => Float, { nullable: true })
  latestCleanOneRepMaxKg: number | null;

  @Field(() => Float, { nullable: true })
  recentRirTrend: number | null;

  @Field()
  latestSessionFlagged: boolean;

  @Field(() => Float, { nullable: true })
  performanceDropRatio: number | null;

  @Field()
  contextSummary: string;

  @Field(() => Int)
  sampleSize: number;

  @Field()
  isColdStart: boolean;
}
