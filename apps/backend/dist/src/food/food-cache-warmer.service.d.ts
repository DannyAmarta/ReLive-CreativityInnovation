import { FoodService } from './food.service';
export declare class FoodCacheWarmerService {
    private readonly foodService;
    private readonly logger;
    private readonly searchKeywords;
    constructor(foodService: FoodService);
    handleDailyCacheWarming(): Promise<void>;
}
