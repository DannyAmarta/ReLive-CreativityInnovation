import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class WithdrawalRequestEntity {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  trainerId!: number;

  @Field(() => Int)
  amountIdr!: number;

  @Field(() => String, { nullable: true })
  bankCode?: string | null;

  @Field(() => String, { nullable: true })
  accountNumber?: string | null;

  @Field(() => String, { nullable: true })
  accountName?: string | null;

  @Field(() => String)
  paymentMethod!: string;

  @Field(() => String)
  status!: string;

  @Field(() => String, { nullable: true })
  gatewayReference?: string | null;

  @Field(() => Date)
  requestedAt!: Date;

  @Field(() => Date, { nullable: true })
  processedAt?: Date | null;

  @Field(() => String, { nullable: true })
  failureReason?: string | null;
}