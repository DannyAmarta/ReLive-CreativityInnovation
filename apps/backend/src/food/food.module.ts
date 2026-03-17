import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FoodController } from './food.controller';
import { FoodResolver } from './food.resolver';
import { FoodService } from './food.service';
import { UsdaFoodConnector } from './providers/usda-food.connector';
import { OpenFoodFactsConnector } from './providers/open-food-facts.connector';

@Module({
  imports: [PrismaModule],
  controllers: [FoodController],
  providers: [
    FoodResolver,
    FoodService,
    UsdaFoodConnector,
    OpenFoodFactsConnector,
  ],
})
export class FoodModule {}
