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
  paymentType?: string;

  @Field({ nullable: true })
  txHash?: string;

  @Field({ nullable: true })
  escrowAddress?: string;

  @Field(() => Int, { nullable: true })
  fiatAmount?: number;

  @Field(() => Int, { nullable: true })
  servicePriceIdr?: number;

  @Field(() => Int, { nullable: true })
  processingFeeIdr?: number;

  @Field({ nullable: true })
  gatewayPaymentMethod?: string;

  @Field({ nullable: true })
  disputeReason?: string;

  @Field({ nullable: true })
  scheduledStart?: Date;

  @Field({ nullable: true })
  scheduledEnd?: Date;

  @Field({ nullable: true })
  timezone?: string;

  @Field({ nullable: true })
  meetingLink?: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
