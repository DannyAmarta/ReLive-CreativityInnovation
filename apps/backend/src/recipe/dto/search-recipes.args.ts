import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

@ArgsType()
export class SearchRecipesArgs {
  @Field()
  @IsString()
  @MinLength(1)
  query: string;

  @Field(() => Int, { defaultValue: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page = 1;

  @Field(() => Int, { defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  pageSize = 10;
}
