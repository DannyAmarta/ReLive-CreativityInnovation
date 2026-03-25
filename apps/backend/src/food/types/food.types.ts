import { Food } from '../entities/food.entity';

export type FoodSearchParams = {
  query: string;
  page: number;
  pageSize: number;
  servingSize: number;
};

export type FoodProviderResult = {
  items: Food[];
};
