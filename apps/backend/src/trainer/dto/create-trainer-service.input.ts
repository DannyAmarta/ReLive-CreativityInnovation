import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsPositive, IsNumber } from 'class-validator';

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

  // Stored as a number representing the full lamport value (integer).
  // Use string on the Rust side to avoid JS floating-point precision issues.
  @IsNumber()
  @IsPositive()
  @Field()
  priceInLamports: number;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  tokenMintAddress?: string;
}
