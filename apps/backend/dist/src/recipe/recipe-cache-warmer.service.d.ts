import { RecipeService } from './recipe.service';
export declare class RecipeCacheWarmerService {
    private readonly recipeService;
    private readonly logger;
    private readonly searchKeywords;
    constructor(recipeService: RecipeService);
    handleDailyCacheWarming(): Promise<void>;
}
