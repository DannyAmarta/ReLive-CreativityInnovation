import { Recipe } from '../types/recipe.types';
export declare function normalizeInstructions(value: string | null | undefined): string;
export declare function normalizeIngredients(values: Array<string | null | undefined>): string[];
export declare function normalizeNumericValue(value: number | null | undefined): number | null;
export declare function createRecipeId(source: Recipe['source'], sourceId: string): string;
