import { BadRequestException, Controller, Get, Header, Query } from '@nestjs/common';
import { RecipeService } from './recipe.service';

@Controller('api/recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Get()
  @Header('Cache-Control', 'public, max-age=60')
  // This REST endpoint powers the frontend cookbook search page.
  // It is used by the Next.js recipe service wrapper with simple query-string params.
  async searchRecipes(
    @Query('query') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!query?.trim()) {
      throw new BadRequestException('query is required');
    }

    return this.recipeService.searchRecipes({
      query,
      page: this.toPositiveInteger(page, 1),
      pageSize: this.toPositiveInteger(limit, 10),
    });
  }

  // This helper sanitizes numeric query-string values without making the endpoint brittle.
  // It is used only by searchRecipes for pagination values.
  private toPositiveInteger(value: string | undefined, fallbackValue: number) {
    if (!value) {
      return fallbackValue;
    }

    const parsedValue = Number(value);
    if (!Number.isFinite(parsedValue) || parsedValue < 1) {
      return fallbackValue;
    }

    return Math.trunc(parsedValue);
  }
}
