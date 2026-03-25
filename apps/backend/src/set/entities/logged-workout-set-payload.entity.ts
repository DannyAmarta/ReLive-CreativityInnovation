import { Field, ObjectType } from '@nestjs/graphql';
import { SetCalculationResult } from './set-calculation-result.entity';
import { LoggedWorkoutSet } from './logged-workout-set.entity';
import { SetPerformanceAnalytics } from './set-performance-analytics.entity';

@ObjectType()
export class LoggedWorkoutSetPayload {
  @Field(() => LoggedWorkoutSet)
  loggedSet: LoggedWorkoutSet;

  @Field(() => SetCalculationResult)
  calculation: SetCalculationResult;

  @Field(() => SetPerformanceAnalytics)
  analytics: SetPerformanceAnalytics;
}
