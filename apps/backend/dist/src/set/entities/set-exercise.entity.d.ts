import { SetExerciseCategory, SetFormulaId } from '../set.types';
export declare class SetExercise {
    id: string;
    name: string;
    category: SetExerciseCategory;
    formula: SetFormulaId;
    description: string;
    repCap: number | null;
    requiredMetrics: string[];
}
