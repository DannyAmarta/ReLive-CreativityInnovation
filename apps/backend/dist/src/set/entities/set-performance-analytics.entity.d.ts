export declare class SetPerformanceAnalytics {
    exerciseId: string;
    exerciseName: string;
    periodDays: number;
    emaOneRepMaxKg: number | null;
    baselineAverageOneRepMaxKg: number | null;
    latestLoggedOneRepMaxKg: number | null;
    latestCleanOneRepMaxKg: number | null;
    recentRirTrend: number | null;
    latestSessionFlagged: boolean;
    performanceDropRatio: number | null;
    contextSummary: string;
    sampleSize: number;
    isColdStart: boolean;
}
