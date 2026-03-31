import { RecipeService } from './recipe.service';
import { SearchRecipesArgs } from './dto/search-recipes.args';
export declare class RecipeResolver {
    private readonly recipeService;
    constructor(recipeService: RecipeService);
    searchRecipes(args: SearchRecipesArgs): Promise<import("./types/recipe.types").RecipeSearchResponse>;
}
