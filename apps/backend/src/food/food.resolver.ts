import { Args, Query, Resolver } from '@nestjs/graphql';
import { FoodService } from './food.service';
import { FoodSearchResponse } from './entities/food-search-response.entity';
import { SearchFoodsArgs } from './dto/search-foods.args';

@Resolver()
export class FoodResolver {
  constructor(private readonly foodService: FoodService) {}

  @Query(() => FoodSearchResponse)
  // GraphQL is the canonical contract for this feature.
  // Keep food search on the resolver/schema path instead of adding REST routes.
  async searchFoods(@Args() args: SearchFoodsArgs) {
    // The resolver stays thin so the cache/search/fallback behavior lives in
    // one backend service while the schema remains the public contract.
    return this.foodService.searchFoods(args);
  }
}
