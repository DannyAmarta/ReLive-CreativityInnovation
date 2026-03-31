import { Food } from '../entities/food.entity';
import { FoodNutrients } from '../entities/food-nutrients.entity';
export declare function createFoodNutrients(values: Partial<FoodNutrients>): FoodNutrients;
export declare function isUsefulFood(food: Food): boolean;
export declare function toNullableNumber(value: unknown): number | null;
export declare function roundToTwoDecimals(value: number | null): number | null;
export declare function scaleNutrientsForServing(nutrients: FoodNutrients, servingSize: number): FoodNutrients;
