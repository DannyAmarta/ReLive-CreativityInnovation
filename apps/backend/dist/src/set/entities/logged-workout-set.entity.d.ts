import { SetFormulaId } from '../set.types';
export declare class LoggedWorkoutSet {
    id: number;
    userId: number;
    exerciseId: string;
    exerciseName: string;
    formulaUsed: SetFormulaId;
    weightLifted: number | null;
    actualReps: number | null;
    rirLogged: number | null;
    calculated1Rm: number | null;
    isCnsFatigue: boolean;
    durationMinutes: number | null;
    distanceMeters: number | null;
    rpeLogged: number | null;
    notes: string | null;
    createdAt: Date;
}
