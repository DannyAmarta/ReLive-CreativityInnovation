import { Field, Float, ObjectType } from '@nestjs/graphql';
import { FoodNutrients } from './food-nutrients.entity';

@ObjectType()
export class Food {
  @Field(() => String)
  id: string;

  @Field(() => String)
  source: string;

  @Field(() => String)
  sourceId: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => String, { nullable: true })
  brand?: string | null;

  @Field(() => Float, { nullable: true })
  referenceServingSize?: number | null;

  @Field(() => String, { nullable: true })
  referenceServingUnit?: string | null;

  @Field(() => Float)
  servingSize: number;

  @Field(() => String)
  servingUnit: string;

  @Field(() => FoodNutrients)
  per100gNutrients: FoodNutrients;

  @Field(() => FoodNutrients)
  nutrients: FoodNutrients;
}
