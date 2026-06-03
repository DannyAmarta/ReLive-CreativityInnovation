import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, Matches } from 'class-validator';

const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

@InputType()
export class UpdateTrainerCryptoSettingsInput {
  @IsOptional()
  @IsString()
  @Matches(SOLANA_ADDRESS_REGEX, {
    message: 'walletAddress must be a valid Solana base58 address',
  })
  @Field({ nullable: true })
  walletAddress?: string;

  @IsOptional()
  @IsString()
  @Matches(SOLANA_ADDRESS_REGEX, {
    message: 'payoutMintAddress must be a valid Solana base58 address',
  })
  @Field({ nullable: true })
  payoutMintAddress?: string;
}
