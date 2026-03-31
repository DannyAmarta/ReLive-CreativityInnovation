import { FoodProviderResult, FoodSearchParams } from '../types/food.types';
export declare class OpenFoodFactsConnector {
    searchFoods(params: FoodSearchParams): Promise<FoodProviderResult>;
    private mapProduct;
    private mapPer100gNutrients;
    private resolveValue;
}
