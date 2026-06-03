import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsPositive, IsNumber, IsInt, Matches } from 'class-validator';

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

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
  @Matches(SOLANA_ADDRESS_REGEX, {
    message: 'tokenMintAddress must be a valid Solana base58 address',
  })
  @Field({ nullable: true })
  tokenMintAddress?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Field({ nullable: true })
  priceInIdr?: number;
}
