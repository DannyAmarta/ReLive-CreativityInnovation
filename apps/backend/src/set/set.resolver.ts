import { JwtService } from '@nestjs/jwt';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { extractUserIdFromGraphqlContext } from '../core/auth/extract-user-id';
import { CalculateSetInput } from './dto/calculate-set.input';
import { LogWorkoutSetInput } from './dto/log-workout-set.input';
import { SetAnalyticsArgs } from './dto/set-analytics.args';
import { LoggedWorkoutSetPayload } from './entities/logged-workout-set-payload.entity';
import { SetCalculationResult } from './entities/set-calculation-result.entity';
import { SetExercise } from './entities/set-exercise.entity';
import { SetPerformanceAnalytics } from './entities/set-performance-analytics.entity';
import { SetService } from './set.service';

@Resolver()
export class SetResolver {
  constructor(
    private readonly setService: SetService,
    private readonly jwtService: JwtService,
  ) {}

  @Query(() => [SetExercise])
  setExercises() {
    return this.setService.getExercises();
  }

  @Query(() => SetCalculationResult)
  calculateSetEstimate(@Args('input') input: CalculateSetInput) {
    return this.setService.calculate(input);
  }

  @Mutation(() => LoggedWorkoutSetPayload)
  async logWorkoutSet(
    @Args('input') input: LogWorkoutSetInput,
    @Context() ctx: { req: { headers: Record<string, string> } },
  ) {
    const userId = extractUserIdFromGraphqlContext(this.jwtService, ctx);
    return this.setService.logSet(userId, input);
  }

  @Query(() => SetPerformanceAnalytics)
  async setPerformanceAnalytics(
    @Args() args: SetAnalyticsArgs,
    @Context() ctx: { req: { headers: Record<string, string> } },
  ) {
    const userId = extractUserIdFromGraphqlContext(this.jwtService, ctx);
    return this.setService.getPerformanceAnalytics(
      userId,
      args.exerciseId,
      args.days ?? 14,
    );
  }
}
