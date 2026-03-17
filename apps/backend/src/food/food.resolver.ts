import { Args, Query, Resolver } from '@nestjs/graphql';
import { FoodService } from './food.service';
import { FoodSearchResponse } from './entities/food-search-response.entity';
import { SearchFoodsArgs } from './dto/search-foods.args';

@Resolver()
export class FoodResolver {
  constructor(private readonly foodService: FoodService) {}

  @Query(() => FoodSearchResponse)
  // GraphQL query entry point for food search.
  // Used by clients that prefer the /graphql endpoint over REST.
  async searchFoods(@Args() args: SearchFoodsArgs) {
    // GraphQL and REST intentionally share the same service so we only keep one
    // implementation of the cache/search/fallback behavior.
    return this.foodService.searchFoods(args);
  }
}
