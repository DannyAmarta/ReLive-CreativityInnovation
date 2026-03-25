import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FoodService } from './food.service';

@Injectable()
export class FoodCacheWarmerService {
  private readonly logger = new Logger(FoodCacheWarmerService.name);

  // A comprehensive list of common gym and health foods.
  // Preloading these guarantees the vast majority of user searches hit the 0ms local database cache.
  private readonly searchKeywords = [
    'chicken breast', 'eggs', 'oats', 'whey protein', 'banana', 'rice',
    'broccoli', 'salmon', 'sweet potato', 'almonds', 'peanut butter',
    'spinach', 'greek yogurt', 'tuna', 'avocado', 'quinoa', 'cottage cheese',
    'beef', 'turkey', 'milk', 'protein bar', 'olive oil', 'chia seeds', 'apple'
  ];

  constructor(private readonly foodService: FoodService) {}

  /**
   * Runs daily at 4:00 AM, avoiding Spoonacular's 3:00 AM cron traffic.
   * Proactively hits the USDA and OpenFoodFacts APIs to store records securely in PostgreSQL.
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async handleDailyCacheWarming() {
    this.logger.log('🔥 Starting daily Food Cache Warming job...');

    // Pick 5 random keywords per day to slowly and securely build up thousands of records
    const shuffled = [...this.searchKeywords].sort(() => 0.5 - Math.random());
    const keywordsForToday = shuffled.slice(0, 5);

    for (const keyword of keywordsForToday) {
      this.logger.log(`Warming food cache for keyword: "${keyword}"`);
      
      try {
        await this.foodService.searchFoods({
          query: keyword,
          page: 1,
          pageSize: 20, 
          servingSize: 100,
        });

        this.logger.log(`✅ Successfully cached food results for "${keyword}"`);
        
        // Wait 2 seconds to not overwhelm the USDA API
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
      } catch (error) {
        this.logger.error(`❌ Failed to warm food cache for "${keyword}"`, error?.stack);
      }
    }

    this.logger.log('🏁 Daily Food Cache Warming completed.');
  }
}
