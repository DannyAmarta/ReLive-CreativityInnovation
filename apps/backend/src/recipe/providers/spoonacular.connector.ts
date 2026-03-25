import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SearchRecipesArgs,
  Recipe,
  RecipeSearchResponse,
} from '../types/recipe.types';
import {
  createRecipeId,
  normalizeIngredients,
  normalizeInstructions,
  normalizeNumericValue,
} from './recipe-mapper';

export class SpoonacularQuotaExceededError extends Error {
  constructor(message = 'Spoonacular quota exceeded') {
    super(message);
    this.name = 'SpoonacularQuotaExceededError';
  }
}

type SpoonacularSearchResponse = {
  results?: SpoonacularRecipe[];
};

type SpoonacularRecipe = {
  id: number;
  title: string;
  image: string;
  readyInMinutes?: number;
  sourceUrl?: string;
  diets?: string[];
  extendedIngredients?: Array<{
    original?: string;
    amount?: number;
    unit?: string;
    name?: string;
  }>;
  instructions?: string;
  analyzedInstructions?: Array<{
    steps?: Array<{ step?: string }>;
  }>;
  nutrition?: {
    nutrients?: Array<{
      name?: string;
      amount?: number;
      unit?: string;
    }>;
  };
};

type SpoonacularNutrient = {
  name?: string;
  amount?: number;
  unit?: string;
};

@Injectable()
export class SpoonacularConnector {
  constructor(private readonly configService: ConfigService) {}

  // This function queries Spoonacular's recipe search endpoint.
  // It is used by RecipeService as the primary external recipe source.
  async searchRecipes(args: SearchRecipesArgs): Promise<RecipeSearchResponse> {
    const apiKey = this.configService.get<string>('SPOONACULAR_API_KEY');
    if (!apiKey) {
      return this.emptyResponse(args.query, args.page, args.pageSize);
    }

    const offset = (args.page - 1) * args.pageSize;
    const searchParams = new URLSearchParams({
      query: args.query,
      number: String(args.pageSize),
      offset: String(offset),
      addRecipeInformation: 'true',
      addRecipeNutrition: 'true',
      fillIngredients: 'true',
      instructionsRequired: 'true',
      apiKey,
    });

    const response = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?${searchParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 402 || response.status === 429) {
        throw new SpoonacularQuotaExceededError(
          `Spoonacular quota or rate limit reached with status ${response.status}`,
        );
      }

      throw new Error(
        `Spoonacular request failed with status ${response.status}`,
      );
    }

    const payload = (await response.json()) as SpoonacularSearchResponse;
    const items = (payload.results ?? []).map((recipe) =>
      this.mapRecipe(recipe),
    );

    return {
      query: args.query,
      sourceUsed: items.length > 0 ? 'SPOONACULAR' : 'NONE',
      cacheHit: false,
      fallbackUsed: false,
      page: args.page,
      pageSize: args.pageSize,
      totalReturned: items.length,
      items,
    };
  }

  // This helper maps a Spoonacular recipe into the shared recipe shape.
  // It is used only after successful Spoonacular API responses.
  private mapRecipe(recipe: SpoonacularRecipe): Recipe {
    const nutrients = recipe.nutrition?.nutrients ?? [];
    const calories = this.resolveNutrientAmount(nutrients, 'Calories');
    const protein = this.resolveNutrientAmount(nutrients, 'Protein');
    const analyzedSteps =
      recipe.analyzedInstructions?.[0]?.steps
        ?.map((step) => step.step?.trim() ?? '')
        .filter(Boolean)
        .join('\n\n') ?? '';

    const ingredients = normalizeIngredients(
      (recipe.extendedIngredients ?? []).map((ingredient) => {
        if (ingredient.original) {
          return ingredient.original;
        }

        return [ingredient.amount, ingredient.unit, ingredient.name]
          .filter(
            (part) => part !== undefined && part !== null && `${part}`.trim(),
          )
          .join(' ');
      }),
    );

    return {
      id: createRecipeId('SPOONACULAR', String(recipe.id)),
      source: 'SPOONACULAR',
      sourceId: String(recipe.id),
      title: recipe.title,
      image: recipe.image,
      calories,
      protein,
      cookTime: normalizeNumericValue(recipe.readyInMinutes) as number | null,
      ingredients,
      instructions: normalizeInstructions(recipe.instructions || analyzedSteps),
      sourceUrl: recipe.sourceUrl ?? null,
      dietTags: normalizeIngredients(recipe.diets ?? []),
    };
  }

  // This helper finds a named nutrient inside Spoonacular nutrition arrays.
  // It is used by mapRecipe for calories and protein extraction.
  private resolveNutrientAmount(
    nutrients: SpoonacularNutrient[] | undefined,
    nutrientName: string,
  ) {
    const match = nutrients?.find(
      (nutrient) => nutrient.name?.toLowerCase() === nutrientName.toLowerCase(),
    );

    return normalizeNumericValue(match?.amount);
  }

  // This helper returns a shaped empty response when Spoonacular is disabled.
  // It is used by searchRecipes when no API key is configured.
  private emptyResponse(
    query: string,
    page: number,
    pageSize: number,
  ): RecipeSearchResponse {
    return {
      query,
      sourceUsed: 'NONE',
      cacheHit: false,
      fallbackUsed: false,
      page,
      pageSize,
      totalReturned: 0,
      items: [],
    };
  }
}
