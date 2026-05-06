import { Field, Int, ObjectType } from '@nestjs/graphql';
import { User } from '../../user/entities/user.entity';
import { TrainerProfile } from './trainer-profile.model';
import { TrainerService } from './trainer-service.model';

@ObjectType()
export class Booking {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  clientId: number;

  @Field(() => User, { nullable: true })
  client?: User;

  @Field(() => Int)
  trainerId: number;

  @Field(() => TrainerProfile, { nullable: true })
  trainer?: TrainerProfile;

  @Field(() => Int)
  serviceId: number;

  @Field(() => TrainerService, { nullable: true })
  service?: TrainerService;

  @Field()
  status: string;

  @Field({ nullable: true })
  txHash?: string;

  @Field({ nullable: true })
  escrowAddress?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
