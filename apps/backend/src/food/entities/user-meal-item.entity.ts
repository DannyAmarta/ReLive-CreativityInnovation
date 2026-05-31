import { Field, Float, GraphQLISODateTime, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { FoodSourceEnum } from './user-favorite-food.entity';

@ObjectType()
export class UserMealItemEntity {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

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

  @Field(() => GraphQLISODateTime)
  addedAt: Date;

  @Field(() => GraphQLISODateTime)
  updatedAt: Date;
}
