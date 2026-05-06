import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as CurrentUserTypes from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { FiatPaymentService } from './fiat-payment.service';
import { RequestFiatDepositInput } from './dto/request-fiat-deposit.input';
import { RequestWithdrawalInput } from './dto/request-withdrawal.input';
import { FiatDepositResponse } from './entities/fiat-deposit-response.entity';
import { FiatWalletEntity } from './entities/fiat-wallet.entity';
import { WithdrawalRequestEntity } from './entities/withdrawal-request.entity';

@Resolver()
export class FiatPaymentResolver {
  constructor(private fiatPaymentService: FiatPaymentService) {}

  // FIX #1: No more manual JWT extraction or JwtService injection.
  // @CurrentUser() provides the full authenticated user from the guard pipeline.

  @Mutation(() => FiatDepositResponse)
  @UseGuards(JwtAuthGuard)
  async requestFiatBookingDeposit(
    @Args('input') input: RequestFiatDepositInput,
    @CurrentUser() user: CurrentUserTypes.CurrentUserPayload,
  ): Promise<FiatDepositResponse> {
    return this.fiatPaymentService.createDeposit(user, input.bookingId);
  }

  @Mutation(() => WithdrawalRequestEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER)
  async requestFiatWithdrawal(
    @Args('input') input: RequestWithdrawalInput,
    @CurrentUser() user: CurrentUserTypes.CurrentUserPayload,
  ): Promise<WithdrawalRequestEntity> {
    const result = await this.fiatPaymentService.requestWithdrawal(user, input);
    if (!result) throw new Error('Withdrawal request failed unexpectedly');
    return result;
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async adminRefundFiatBooking(
    @Args('bookingId') bookingId: number,
  ): Promise<boolean> {
    await this.fiatPaymentService.adminRefund(bookingId);
    return true;
  }

  @Query(() => FiatWalletEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.TRAINER)
  async myFiatWallet(
    @CurrentUser() user: CurrentUserTypes.CurrentUserPayload,
  ): Promise<FiatWalletEntity> {
    return this.fiatPaymentService.getWallet(user);
  }
}