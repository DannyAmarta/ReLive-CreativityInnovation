import { Field, InputType } from '@nestjs/graphql';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

@InputType()
export class FeatureAnalysisDto {
  @Field()
  @IsString()
  @MinLength(12)
  @MaxLength(5000)
  featureRequest: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  featureName?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(1200)
  systemContext?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(180, { each: true })
  focusAreas?: string[];
}
