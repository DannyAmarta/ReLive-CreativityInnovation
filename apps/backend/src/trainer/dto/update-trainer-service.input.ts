import { InputType, Field, Float, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

@InputType()
export class UpdateTrainerServiceInput {
  @IsInt()
  @Field(() => Int)
  serviceId: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  title?: string;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Field({ nullable: true })
  priceInLamports?: number;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isActive?: boolean;
}
