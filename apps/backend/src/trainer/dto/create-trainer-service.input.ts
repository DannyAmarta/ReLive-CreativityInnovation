import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsPositive, IsNumber, IsInt } from 'class-validator';

@InputType()
export class CreateTrainerServiceInput {
  @IsString()
  @IsNotEmpty()
  @Field()
  title: string;

  @IsString()
  @IsNotEmpty()
  @Field()
  description: string;

  // Optional — if omitted the service is Fiat-only (no crypto booking button shown)
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Field({ nullable: true })
  priceInLamports?: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  tokenMintAddress?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Field({ nullable: true })
  priceInIdr?: number;
}
