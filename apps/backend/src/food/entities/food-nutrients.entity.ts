import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FoodNutrients {
  @Field(() => Float, { nullable: true })
  calories?: number | null;

  @Field(() => Float, { nullable: true })
  proteinGrams?: number | null;

  @Field(() => Float, { nullable: true })
  carbsGrams?: number | null;

  @Field(() => Float, { nullable: true })
  fatGrams?: number | null;

  @Field(() => Float, { nullable: true })
  fiberGrams?: number | null;

  @Field(() => Float, { nullable: true })
  sugarGrams?: number | null;

  @Field(() => Float, { nullable: true })
  sodiumMilligrams?: number | null;
}
