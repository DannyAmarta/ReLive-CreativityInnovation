import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum FoodSourceEnum {
  USDA = 'USDA',
  OFF = 'OFF',
}

registerEnumType(FoodSourceEnum, { name: 'FoodSource' });

@ObjectType()
export class UserFavoriteFoodEntity {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field()
  foodId: string;

  @Field()
  foodName: string;

  @Field({ nullable: true })
  brand?: string;

  @Field(() => FoodSourceEnum)
  source: FoodSourceEnum;

  @Field()
  createdAt: Date;
}
