import { ConfigService } from '@nestjs/config';
import { FoodProviderResult, FoodSearchParams } from '../types/food.types';
export declare class UsdaFoodConnector {
    private readonly configService;
    constructor(configService: ConfigService);
    searchFoods(params: FoodSearchParams): Promise<FoodProviderResult>;
    private mapFood;
    private mapPer100gNutrients;
    private resolveNutrient;
}
