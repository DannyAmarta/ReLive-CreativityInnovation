import { Args, Query, Resolver } from '@nestjs/graphql';
import { RecipeService } from './recipe.service';
import { RecipeSearchResponse } from './entities/recipe-search-response.entity';
import { SearchRecipesArgs } from './dto/search-recipes.args';

@Resolver()
export class RecipeResolver {
  constructor(private readonly recipeService: RecipeService) {}

  @Query(() => RecipeSearchResponse)
  // GraphQL query entry point for recipe search.
  // Used by clients that prefer the /graphql endpoint over REST.
  async searchRecipes(@Args() args: SearchRecipesArgs) {
    // GraphQL and REST intentionally share the same service so we only keep one
    // implementation of the cache/search/fallback behavior.
    return this.recipeService.searchRecipes(args);
  }
}
