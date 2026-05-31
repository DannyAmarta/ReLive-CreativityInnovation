import { Field, Float, InputType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { FoodSourceEnum } from '../entities/user-favorite-food.entity';

@InputType()
export class UpsertMealItemInput {
  @Field()
  foodId: string;

  @Field()
  foodName: string;

  @Field({ nullable: true })
  brand?: string;

  @Field(() => FoodSourceEnum)
  source: FoodSourceEnum;

  @Field(() => Float)
  servingSize: number;

  @Field(() => GraphQLJSON)
  nutrientsJson: Record<string, number>;
}
