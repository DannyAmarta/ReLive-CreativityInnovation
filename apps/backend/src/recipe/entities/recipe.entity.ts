import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Recipe {
  @Field(() => String)
  id: string;

  @Field(() => String)
  source: string;

  @Field(() => String)
  sourceId: string;

  @Field(() => String)
  title: string;

  @Field(() => String)
  image: string;

  @Field(() => Float, { nullable: true })
  calories?: number | null;

  @Field(() => Float, { nullable: true })
  protein?: number | null;

  @Field(() => Float, { nullable: true })
  cookTime?: number | null;

  @Field(() => [String])
  ingredients: string[];

  @Field(() => String)
  instructions: string;

  @Field(() => String, { nullable: true })
  sourceUrl?: string | null;

  @Field(() => [String])
  dietTags: string[];
}
