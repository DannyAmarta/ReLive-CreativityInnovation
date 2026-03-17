import { Injectable } from '@nestjs/common';
import { SearchRecipesArgs, Recipe, RecipeSearchResponse } from '../recipe.types';
import {
  createRecipeId,
  normalizeIngredients,
  normalizeInstructions,
} from './recipe-mapper';

type MealDbSearchResponse = {
  meals: MealDbRecipe[] | null;
};

type MealDbRecipe = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions?: string;
  strCategory?: string;
  strArea?: string;
  strSource?: string;
  [key: string]: string | undefined;
};

@Injectable()
export class TheMealDbConnector {
  // This function queries TheMealDB as the fallback recipe provider.
  // It is used by RecipeService only when Spoonacular does not produce usable results.
  async searchRecipes(args: SearchRecipesArgs): Promise<RecipeSearchResponse> {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(args.query)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`TheMealDB request failed with status ${response.status}`);
    }

    const payload = (await response.json()) as MealDbSearchResponse;
    const startIndex = (args.page - 1) * args.pageSize;
    const items = (payload.meals ?? [])
      .slice(startIndex, startIndex + args.pageSize)
      .map((recipe) => this.mapRecipe(recipe));

    return {
      query: args.query,
      sourceUsed: items.length > 0 ? 'THE_MEAL_DB' : 'NONE',
      cacheHit: false,
      fallbackUsed: true,
      page: args.page,
      pageSize: args.pageSize,
      totalReturned: items.length,
      items,
    };
  }

  // This helper maps TheMealDB fields into the shared recipe shape.
  // It is used only after TheMealDB API responses.
  private mapRecipe(recipe: MealDbRecipe): Recipe {
    return {
      id: createRecipeId('THE_MEAL_DB', recipe.idMeal),
      source: 'THE_MEAL_DB',
      sourceId: recipe.idMeal,
      title: recipe.strMeal,
      image: recipe.strMealThumb,
      calories: null,
      protein: null,
      cookTime: null,
      ingredients: this.extractIngredients(recipe),
      instructions: normalizeInstructions(recipe.strInstructions),
      sourceUrl: recipe.strSource ?? null,
      dietTags: normalizeIngredients([recipe.strCategory, recipe.strArea]),
    };
  }

  // This helper collects the numbered ingredient fields exposed by TheMealDB.
  // It is used by mapRecipe because TheMealDB stores ingredients across multiple columns.
  private extractIngredients(recipe: MealDbRecipe) {
    return normalizeIngredients(
      Array.from({ length: 20 }, (_, index) => {
        const ingredient = recipe[`strIngredient${index + 1}`];
        const measure = recipe[`strMeasure${index + 1}`];

        return [measure, ingredient].filter(Boolean).join(' ');
      }),
    );
  }
}
