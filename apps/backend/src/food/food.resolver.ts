import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FoodService } from './food.service';
import { FoodSearchResponse } from './entities/food-search-response.entity';
import { SearchFoodsArgs } from './dto/search-foods.args';
import { UserFavoriteFoodEntity } from './entities/user-favorite-food.entity';
import { UserMealItemEntity } from './entities/user-meal-item.entity';
import { ToggleFavoriteFoodInput } from './dto/toggle-favorite-food.input';
import { UpsertMealItemInput } from './dto/upsert-meal-item.input';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Resolver()
export class FoodResolver {
  constructor(private readonly foodService: FoodService) {}

  @Query(() => FoodSearchResponse)
  async searchFoods(@Args() args: SearchFoodsArgs) {
    return this.foodService.searchFoods(args);
  }

  // ─── User Favorite Foods ─────────────────────────────────────────────────
  @Query(() => [UserFavoriteFoodEntity])
  @UseGuards(JwtAuthGuard)
  async myFavoriteFoods(@CurrentUser() user: { id: number }) {
    return this.foodService.getFavoriteFoods(user.id);
  }

  @Mutation(() => UserFavoriteFoodEntity, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async toggleFavoriteFood(
    @CurrentUser() user: { id: number },
    @Args('input') input: ToggleFavoriteFoodInput,
  ) {
    return this.foodService.toggleFavoriteFood(user.id, input);
  }

  // ─── User Meal Items ──────────────────────────────────────────────────────
  @Query(() => [UserMealItemEntity])
  @UseGuards(JwtAuthGuard)
  async myMealItems(@CurrentUser() user: { id: number }) {
    return this.foodService.getMealItems(user.id);
  }

  @Mutation(() => UserMealItemEntity)
  @UseGuards(JwtAuthGuard)
  async upsertMealItem(
    @CurrentUser() user: { id: number },
    @Args('input') input: UpsertMealItemInput,
  ) {
    return this.foodService.upsertMealItem(user.id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async removeMealItem(
    @CurrentUser() user: { id: number },
    @Args('id', { type: () => Int }) id: number,
  ) {
    return this.foodService.removeMealItem(user.id, id);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard)
  async clearMealItems(@CurrentUser() user: { id: number }) {
    return this.foodService.clearMealItems(user.id);
  }
}
