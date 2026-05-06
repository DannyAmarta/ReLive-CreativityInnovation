import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class RequestWithdrawalInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  amountIdr!: number;

  @Field(() => String)
  @IsString()
  paymentMethod!: string; // 'BANK_TRANSFER' or 'EWALLET'

  // Bank fields (required if paymentMethod = 'BANK_TRANSFER')
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bankCode?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  accountName?: string;

  // E-wallet fields (required if paymentMethod = 'EWALLET')
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  ewalletPhone?: string; // for GoPay/OVO
}