export interface FoodNutrients {
  calories: number | null;
  proteinGrams: number | null;
  carbsGrams: number | null;
  fatGrams: number | null;
  fiberGrams: number | null;
  sugarGrams: number | null;
  sodiumMilligrams: number | null;
}

export interface Food {
  id: string;
  source: string;
  sourceId: string;
  name: string;
  description: string | null;
  brand: string | null;
  referenceServingSize: number | null;
  referenceServingUnit: string | null;
  servingSize: number;
  servingUnit: string;
  per100gNutrients: FoodNutrients;
  nutrients: FoodNutrients;
}

export interface FoodSearchResponse {
  query: string;
  sourceUsed: string;
  cacheHit: boolean;
  fallbackUsed: boolean;
  page: number;
  pageSize: number;
  servingSize: number;
  totalReturned: number;
  items: Food[];
}

export interface SearchFoodsParams {
  query: string;
  page?: number;
  limit?: number;
  signal?: AbortSignal;
}

export interface SavedFoodReference {
  id: string;
  name: string;
  brand: string | null;
  source: string;
}

export interface MealFoodItem {
  id: string;
  foodId: string;
  name: string;
  brand: string | null;
  source: string;
  servingSize: number;
  per100gNutrients: FoodNutrients;
  nutrients: FoodNutrients;
}
