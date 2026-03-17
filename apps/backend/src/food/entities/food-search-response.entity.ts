import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Food } from './food.entity';

@ObjectType()
export class FoodSearchResponse {
  @Field()
  query: string;

  @Field()
  sourceUsed: string;

  @Field()
  cacheHit: boolean;

  @Field()
  fallbackUsed: boolean;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  pageSize: number;

  @Field(() => Int)
  servingSize: number;

  @Field(() => Int)
  totalReturned: number;

  @Field(() => [Food])
  items: Food[];
}
