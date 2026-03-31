import { Food } from './food.entity';
export declare class FoodSearchResponse {
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
