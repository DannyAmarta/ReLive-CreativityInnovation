export type RecipeSource = "SPOONACULAR" | "THE_MEAL_DB";

export interface Recipe {
  id: string;
  source: RecipeSource;
  sourceId: string;
  title: string;
  image: string;
  calories: number | null;
  protein: number | null;
  cookTime: number | null;
  ingredients: string[];
  instructions: string;
  sourceUrl: string | null;
  dietTags: string[];
}

export interface RecipeSearchResponse {
  query: string;
  sourceUsed: "DATABASE" | "SPOONACULAR" | "THE_MEAL_DB" | "NONE";
  cacheHit: boolean;
  fallbackUsed: boolean;
  page: number;
  pageSize: number;
  totalReturned: number;
  items: Recipe[];
}

export interface SearchRecipesParams {
  query: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}
