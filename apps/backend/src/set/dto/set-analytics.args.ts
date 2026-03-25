import { ArgsType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, Min, MinLength } from 'class-validator';

@ArgsType()
export class SetAnalyticsArgs {
  @Field()
  @IsString()
  @MinLength(1)
  exerciseId: string;

  @Field(() => Int, { nullable: true, defaultValue: 14 })
  @IsOptional()
  @IsInt()
  @Min(7)
  @Max(28)
  days?: number = 14;
}
