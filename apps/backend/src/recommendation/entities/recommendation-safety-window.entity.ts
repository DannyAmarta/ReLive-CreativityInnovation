import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class RecommendationSafetyWindowEntity {
  @Field(() => Float, { nullable: true })
  minWeightKg: number | null;

  @Field(() => Float, { nullable: true })
  maxWeightKg: number | null;

  @Field(() => Int)
  minSets: number;

  @Field(() => Int)
  maxSets: number;

  @Field(() => Int)
  minReps: number;

  @Field(() => Int)
  maxReps: number;
}
