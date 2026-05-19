import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class RequestFiatDepositInput {
  @Field(() => Int)
  @IsInt()
  @Min(1)
  bookingId!: number;

  // Duitku payment method code, e.g. 'LQ' (QRIS), 'VC' (BCA VA), 'O1' (OVO)
  // Defaults to 'VA' (generic Virtual Account) if not supplied.
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  paymentMethodCode?: string;
}