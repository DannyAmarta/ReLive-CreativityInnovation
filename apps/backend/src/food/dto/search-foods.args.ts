import { ArgsType, Field, Int } from '@nestjs/graphql';
import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

@ArgsType()
export class SearchFoodsArgs {
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

  @Field(() => Int, { defaultValue: 100 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5000)
  servingSize = 100;
}
