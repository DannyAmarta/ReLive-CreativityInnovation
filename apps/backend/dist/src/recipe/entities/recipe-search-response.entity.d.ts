import { Recipe } from './recipe.entity';
export declare class RecipeSearchResponse {
    query: string;
    sourceUsed: string;
    cacheHit: boolean;
    fallbackUsed: boolean;
    page: number;
    pageSize: number;
    totalReturned: number;
    items: Recipe[];
}
