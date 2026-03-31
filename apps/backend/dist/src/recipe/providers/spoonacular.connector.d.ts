import { ConfigService } from '@nestjs/config';
import { SearchRecipesArgs, RecipeSearchResponse } from '../types/recipe.types';
export declare class SpoonacularQuotaExceededError extends Error {
    constructor(message?: string);
}
export declare class SpoonacularConnector {
    private readonly configService;
    constructor(configService: ConfigService);
    searchRecipes(args: SearchRecipesArgs): Promise<RecipeSearchResponse>;
    private mapRecipe;
    private resolveNutrientAmount;
    private emptyResponse;
}
