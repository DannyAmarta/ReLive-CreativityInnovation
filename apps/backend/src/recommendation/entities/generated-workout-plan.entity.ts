import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { RecommendationPhaseGoal } from '../dto/generate-plan.dto';
import { RecommendationPlanSource } from '../recommendation.types';
import { GeneratedRoutineEntryEntity } from './generated-routine-entry.entity';
import { RecommendationSafetyWindowEntity } from './recommendation-safety-window.entity';

registerEnumType(RecommendationPlanSource, {
  name: 'RecommendationPlanSource',
});

@ObjectType()
export class GeneratedWorkoutPlanEntity {
  @Field(() => RecommendationPhaseGoal)
  phaseGoal: RecommendationPhaseGoal;

  @Field(() => RecommendationPlanSource)
  source: RecommendationPlanSource;

  @Field(()=> String)
  rationale: string;

  @Field(()=> String)
  contextSummary: string;

  @Field(()=> String, { nullable: true })
  providerNotice?: string | null;

  @Field(() => RecommendationSafetyWindowEntity)
  safetyWindow: RecommendationSafetyWindowEntity;

  @Field(() => [GeneratedRoutineEntryEntity])
  routine: GeneratedRoutineEntryEntity[];
}
