import { FoodService } from './food.service';
import { FoodSearchResponse } from './entities/food-search-response.entity';
import { SearchFoodsArgs } from './dto/search-foods.args';
export declare class FoodResolver {
    private readonly foodService;
    constructor(foodService: FoodService);
    searchFoods(args: SearchFoodsArgs): Promise<FoodSearchResponse>;
}
