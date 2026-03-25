import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RecipeService } from './recipe.service';

@Injectable()
export class RecipeCacheWarmerService {
  private readonly logger = new Logger(RecipeCacheWarmerService.name);

  // A carefully curated list of broad terms that will yield hundreds of unique recipes over time.
  private readonly searchKeywords = [
    'chicken', 'beef', 'vegan', 'pasta', 'salad', 'keto', 
    'breakfast', 'dinner', 'dessert', 'soup', 'healthy',
    'fast', 'smoothie', 'fish', 'rice', 'low carb'
  ];

  constructor(private readonly recipeService: RecipeService) {}

  /**
   * The cron job runs automatically in the background.
   * 'CronExpression.EVERY_DAY_AT_3AM' ensures it runs during low traffic.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyCacheWarming() {
    this.logger.log('🚀 Starting daily Recipe Cache Warming job...');

    // Pick 3 random keywords each day so we slowly cover all bases without spamming the API all at once.
    const shuffled = [...this.searchKeywords].sort(() => 0.5 - Math.random());
    const keywordsForToday = shuffled.slice(0, 3);

    for (const keyword of keywordsForToday) {
      this.logger.log(`Warming cache for keyword: "${keyword}"`);
      
      try {
        // We use our existing robust searchRecipes method.
        // It will automatically hit Spoonacular, get up to 20 results, and UPSERT them into PostgreSQL.
        // If Spoonacular is out of quota today, it safely falls back to TheMealDB!
        await this.recipeService.searchRecipes({
          query: keyword,
          page: 1,
          pageSize: 20, // Maximize the results per API call
        });

        this.logger.log(`✅ Successfully warmed cache for "${keyword}"`);
        
        // Sleep for 2 seconds between requests to be extra polite to the API rate limit (Standard API etiquette)
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
      } catch (error) {
        this.logger.error(`❌ Failed to warm cache for "${keyword}"`, error?.stack);
      }
    }

    this.logger.log('🏁 Daily Recipe Cache Warming job completed.');
  }
}
