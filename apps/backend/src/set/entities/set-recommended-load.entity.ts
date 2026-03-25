import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SetRecommendedLoad {
  @Field(() => Int)
  repTarget: number;

  @Field(() => Float)
  weightKg: number;

  @Field(() => Float)
  intensityPercent: number;
}
