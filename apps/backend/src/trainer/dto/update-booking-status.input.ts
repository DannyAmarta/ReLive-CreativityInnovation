import { InputType, Field, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

// RBAC State Machine:
// TRAINER can: PENDING -> ACTIVE | CANCELLED
// TRAINER can: ACTIVE  -> COMPLETED
// CLIENT  can: ACTIVE  -> DISPUTED
// ADMIN   can: DISPUTED -> COMPLETED | CANCELLED (with resolvedBy)

@InputType()
export class UpdateBookingStatusInput {
  @IsInt()
  @Field(() => Int)
  bookingId: number;

  @IsEnum(BookingStatus, { message: 'status must be a valid BookingStatus value' })
  @Field()
  status: BookingStatus;

  @IsOptional()
  @IsString()
  @Field({ nullable: true })
  disputeReason?: string;
}
