import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsArray, IsOptional, MinLength } from 'class-validator';

@InputType()
export class RegisterTrainerFiatInput {
  @IsString()
  @MinLength(10, { message: 'Bio must be at least 10 characters' })
  @Field()
  bio: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  @Field(() => [String], { defaultValue: [] })
  certifications?: string[];
}
