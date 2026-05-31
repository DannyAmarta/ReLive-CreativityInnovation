import { Field, InputType } from '@nestjs/graphql';
import { FoodSourceEnum } from '../entities/user-favorite-food.entity';

@InputType()
export class ToggleFavoriteFoodInput {
  @Field()
  foodId: string;

  @Field()
  foodName: string;

  @Field({ nullable: true })
  brand?: string;

  @Field(() => FoodSourceEnum)
  source: FoodSourceEnum;
}
