import { Field, Int, ObjectType, Float } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { TrainerService } from './trainer-service.model';

@ObjectType()
export class TrainerProfile {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  userId: number;

  @Field(() => User, { nullable: true })
  user?: User;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => [String])
  certifications: string[];

  @Field(() => Float)
  rating: number;

  @Field({ nullable: true })
  payoutAtaAddress?: string;

  @Field({ nullable: true })
  payoutMintAddress?: string;

  @Field({ nullable: true })
  ataInitializedAt?: Date;

  @Field(() => [TrainerService], { nullable: 'itemsAndList' })
  services?: TrainerService[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
