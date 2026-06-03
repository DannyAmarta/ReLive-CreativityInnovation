import { InputType, Field, Int } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsPositive, IsString, Matches } from 'class-validator';

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

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
  @IsInt()
  @IsPositive()
  @Field({ nullable: true })
  priceInIdr?: number;

  @IsOptional()
  @IsString()
  @Matches(SOLANA_ADDRESS_REGEX, {
    message: 'tokenMintAddress must be a valid Solana base58 address',
  })
  @Field({ nullable: true })
  tokenMintAddress?: string;

  @IsOptional()
  @IsBoolean()
  @Field({ nullable: true })
  isActive?: boolean;
}
