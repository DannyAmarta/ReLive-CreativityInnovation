import { SearchRecipesArgs, RecipeSearchResponse } from '../types/recipe.types';
export declare class TheMealDbConnector {
    searchRecipes(args: SearchRecipesArgs): Promise<RecipeSearchResponse>;
    private mapRecipe;
    private extractIngredients;
}
