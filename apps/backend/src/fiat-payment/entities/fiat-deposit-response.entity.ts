import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FiatDepositResponse {
  @Field(() => String)
  paymentUrl!: string;

  @Field(() => String)
  transactionId!: string;

  @Field(() => Int)
  bookingId!: number;

  @Field(() => Int)
  totalAmount!: number;

  @Field(() => Int)
  fee!: number;
}