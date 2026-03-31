import { RecommendationPhaseGoal } from '../dto/generate-plan.dto';
import { RecommendationPlanSource } from '../recommendation.types';
import { GeneratedRoutineEntryEntity } from './generated-routine-entry.entity';
import { RecommendationSafetyWindowEntity } from './recommendation-safety-window.entity';
export declare class GeneratedWorkoutPlanEntity {
    phaseGoal: RecommendationPhaseGoal;
    source: RecommendationPlanSource;
    rationale: string;
    contextSummary: string;
    providerNotice?: string | null;
    safetyWindow: RecommendationSafetyWindowEntity;
    routine: GeneratedRoutineEntryEntity[];
}
