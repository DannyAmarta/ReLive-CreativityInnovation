//  //kita pake services, ini baut pake kalo yang use use di frontend

import { BadRequestException, Controller, Get, Header, Query } from '@nestjs/common';
// import { FoodService } from './food.service';

@Controller('api/foods')
export class FoodController {
  // constructor(private readonly foodService: FoodService) {}

  //kita pake services, ini baut pake kalo yang use use di frontend
  // @Get()
  // @Header('Cache-Control', 'public, max-age=60')
  // // REST endpoint for the frontend food page.
  // // Used by the Next.js food.service fetch wrapper.
  // async searchFoods(
  //   @Query('query') query?: string,
  //   @Query('page') page?: string,
  //   @Query('limit') limit?: string,
  //   @Query('servingSize') servingSize?: string,
  // ) {
  //   if (!query?.trim()) {
  //     throw new BadRequestException('query is required');
  //   }

  //   // The controller accepts string query params because this endpoint is meant
  //   // to be easy to call directly from the browser or a simple fetch wrapper.
  //   return this.foodService.searchFoods({
  //     query,
  //     page: this.toPositiveInteger(page, 1),
  //     pageSize: this.toPositiveInteger(limit, 10),
  //     servingSize: this.toPositiveInteger(servingSize, 100),
  //   });
  // }

  // // Parses and sanitizes numeric query parameters without failing the whole request.
  // // Used by searchFoods for page, limit, and servingSize.
  // private toPositiveInteger(value: string | undefined, fallbackValue: number) {
  //   // Invalid values fall back instead of throwing so the endpoint remains
  //   // forgiving for debounced client-side search requests.
  //   if (!value) {
  //     return fallbackValue;
  //   }

  //   const parsedValue = Number(value);
  //   if (!Number.isFinite(parsedValue) || parsedValue < 1) {
  //     return fallbackValue;
  //   }

  //   return Math.trunc(parsedValue);
  // }
}
