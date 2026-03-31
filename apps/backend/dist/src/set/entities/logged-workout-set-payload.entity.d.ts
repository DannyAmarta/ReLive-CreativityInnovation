import { SetCalculationResult } from './set-calculation-result.entity';
import { LoggedWorkoutSet } from './logged-workout-set.entity';
import { SetPerformanceAnalytics } from './set-performance-analytics.entity';
export declare class LoggedWorkoutSetPayload {
    loggedSet: LoggedWorkoutSet;
    calculation: SetCalculationResult;
    analytics: SetPerformanceAnalytics;
}
