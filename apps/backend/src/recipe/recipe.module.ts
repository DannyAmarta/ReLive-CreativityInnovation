import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RecipeController } from './lordytrashcan/recipe.controller';
import { RecipeService } from './recipe.service';
import { SpoonacularConnector } from './providers/spoonacular.connector';
import { TheMealDbConnector } from './providers/themealdb.connector';
import { RecipeResolver } from './recipe.resolver';
import { RecipeCacheWarmerService } from './recipe-cache-warmer.service';

@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [
    RecipeService,
    RecipeResolver,
    SpoonacularConnector,
    TheMealDbConnector,
    RecipeCacheWarmerService,
  ],
})
export class RecipeModule {}
