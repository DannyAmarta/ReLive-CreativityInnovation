import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class FiatWalletEntity {
  @Field(() => Int)
  id!: number;

  @Field(() => Int)
  trainerId!: number;

  @Field(() => Int)
  balanceIdr!: number;

  @Field(() => Date)
  updatedAt!: Date;
}