import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Recipe } from './recipe.entity';

@ObjectType()
export class RecipeSearchResponse {
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
  totalReturned: number;

  @Field(() => [Recipe])
  items: Recipe[];
}
