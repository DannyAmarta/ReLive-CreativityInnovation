import { Field, Int, ObjectType, Float } from '@nestjs/graphql';
import { TrainerProfile } from './trainer-profile.model';

@ObjectType()
export class TrainerService {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  trainerId: number;

  @Field(() => TrainerProfile, { nullable: true })
  trainer?: TrainerProfile;

  @Field()
  title: string;

  @Field()
  description: string;

  @Field(() => Float)
  priceInLamports: number;

  @Field()
  tokenMintAddress: string;

  @Field()
  isActive: boolean;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
