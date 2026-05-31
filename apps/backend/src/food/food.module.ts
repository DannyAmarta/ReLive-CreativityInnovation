import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { FoodResolver } from './food.resolver';
import { FoodService } from './food.service';
import { UsdaFoodConnector } from './providers/usda-food.connector';
import { OpenFoodFactsConnector } from './providers/open-food-facts.connector';
import { FoodCacheWarmerService } from './food-cache-warmer.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [],
  providers: [
    FoodResolver,
    FoodService,
    UsdaFoodConnector,
    OpenFoodFactsConnector,
    FoodCacheWarmerService,
  ],
})
export class FoodModule {}
