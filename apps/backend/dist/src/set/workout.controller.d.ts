import { JwtService } from '@nestjs/jwt';
import { LogWorkoutSetInput } from './dto/log-workout-set.input';
import { SetService } from './set.service';
export declare class WorkoutController {
    private readonly setService;
    private readonly jwtService;
    constructor(setService: SetService, jwtService: JwtService);
    logSet(input: LogWorkoutSetInput, req: {
        headers: Record<string, string>;
    }): Promise<import("./set.types").LoggedWorkoutSetPayloadShape>;
    getAnalytics(exerciseId: string, days: string | undefined, req: {
        headers: Record<string, string>;
    }): Promise<import("./set.types").SetPerformanceAnalyticsShape>;
    private extractUserIdFromHeaders;
}
