import { JwtService } from '@nestjs/jwt';
import { CalculateSetInput } from './dto/calculate-set.input';
import { LogWorkoutSetInput } from './dto/log-workout-set.input';
import { SetAnalyticsArgs } from './dto/set-analytics.args';
import { SetService } from './set.service';
export declare class SetResolver {
    private readonly setService;
    private readonly jwtService;
    constructor(setService: SetService, jwtService: JwtService);
    setExercises(): import("./set.types").SetExerciseDefinition[];
    calculateSetEstimate(input: CalculateSetInput): import("./set.types").SetCalculationResultShape;
    logWorkoutSet(input: LogWorkoutSetInput, ctx: {
        req: {
            headers: Record<string, string>;
        };
    }): Promise<import("./set.types").LoggedWorkoutSetPayloadShape>;
    setPerformanceAnalytics(args: SetAnalyticsArgs, ctx: {
        req: {
            headers: Record<string, string>;
        };
    }): Promise<import("./set.types").SetPerformanceAnalyticsShape>;
}
