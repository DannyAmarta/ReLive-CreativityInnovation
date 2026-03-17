import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { SpoonacularConnector } from './providers/spoonacular.connector';
import { TheMealDbConnector } from './providers/themealdb.connector';

@Module({
  imports: [PrismaModule],
  controllers: [RecipeController],
  providers: [RecipeService, SpoonacularConnector, TheMealDbConnector],
})
export class RecipeModule {}
