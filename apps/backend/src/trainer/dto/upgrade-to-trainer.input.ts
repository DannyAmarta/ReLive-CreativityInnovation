import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsArray, Matches, ArrayMinSize } from 'class-validator';

// Solana base58 wallet address: 32-44 chars, base58 charset
const SOLANA_WALLET_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

@InputType()
export class UpgradeToTrainerInput {
  @IsString()
  @Field()
  bio: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1, { message: 'At least one certification is required' })
  @Field(() => [String])
  certifications: string[];

  @Matches(SOLANA_WALLET_REGEX, { message: 'walletAddress must be a valid Solana base58 address' })
  @IsString()
  @Field()
  walletAddress: string;

  @Matches(SOLANA_WALLET_REGEX, { message: 'payoutAtaAddress must be a valid Solana base58 address' })
  @IsString()
  @Field()
  payoutAtaAddress: string;

  @Matches(SOLANA_WALLET_REGEX, { message: 'payoutMintAddress must be a valid Solana base58 address' })
  @IsString()
  @Field()
  payoutMintAddress: string;
}
