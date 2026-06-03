import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserWalletAccount {
  @Field(() => Int)
  id!: number;

  @Field()
  provider!: string;

  @Field()
  walletAddress!: string;

  @Field()
  isActive!: boolean;

  @Field()
  lastUsedAt!: Date;

  @Field()
  createdAt!: Date;
}
