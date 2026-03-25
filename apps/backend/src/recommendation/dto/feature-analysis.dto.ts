import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class FeatureAnalysisDto {
  @IsString()
  @MinLength(12)
  @MaxLength(5000)
  featureRequest: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  featureName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1200)
  systemContext?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(180, { each: true })
  focusAreas?: string[];
}
