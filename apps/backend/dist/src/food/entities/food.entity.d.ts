import { FoodNutrients } from './food-nutrients.entity';
export declare class Food {
    id: string;
    source: string;
    sourceId: string;
    name: string;
    description?: string | null;
    brand?: string | null;
    referenceServingSize?: number | null;
    referenceServingUnit?: string | null;
    servingSize: number;
    servingUnit: string;
    per100gNutrients: FoodNutrients;
    nutrients: FoodNutrients;
}
