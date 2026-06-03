import { Args, Context, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { BookingStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BlockchainTransactionService } from './blockchain-transaction.service';
import { PartialSignedTx } from './models/partial-signed-tx.model';
import { UserWalletAccount } from '../user/entities/user-wallet-account.entity';
import {
  getPendingBookingExpiresAt,
  isPendingBookingExpired,
} from '../trainer/pending-booking.util';

@Resolver()
export class BlockchainResolver {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly txService: BlockchainTransactionService,
  ) {}

  private extractUserId(ctx: { req: { headers: Record<string, string> } }): number {
    const auth = ctx.req?.headers?.authorization ?? '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : auth;
    if (!token) throw new UnauthorizedException('Not authenticated');

    try {
      return this.jwtService.verify<{ sub: number }>(token).sub;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @Query(() => [UserWalletAccount])
  async myWalletAccounts(
    @Context() ctx: { req: { headers: Record<string, string> } },
  ): Promise<UserWalletAccount[]> {
    const userId = this.extractUserId(ctx);

    return (this.prisma as any).userWalletAccount.findMany({
      where: { userId },
      orderBy: [{ isActive: 'desc' }, { lastUsedAt: 'desc' }],
    });
  }

  @Mutation(() => Boolean)
  async rememberWalletAccount(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('provider', { type: () => String }) provider: string,
    @Args('walletAddress', { type: () => String }) walletAddress: string,
    @Args('setActive', { type: () => Boolean, nullable: true }) setActive?: boolean,
  ): Promise<boolean> {
    const userId = this.extractUserId(ctx);
    const normalizedProvider =
      provider?.toUpperCase() === 'SOLFLARE'
        ? 'SOLFLARE'
        : provider?.toUpperCase() === 'PHANTOM'
          ? 'PHANTOM'
          : 'OTHER';

    await this.prisma.$transaction(async (tx) => {
      await (tx as any).userWalletAccount.upsert({
        where: {
          userId_walletAddress: {
            userId,
            walletAddress,
          },
        },
        create: {
          userId,
          provider: normalizedProvider as any,
          walletAddress,
          isActive: setActive ?? true,
          lastUsedAt: new Date(),
        },
        update: {
          provider: normalizedProvider as any,
          isActive: setActive ?? true,
          lastUsedAt: new Date(),
        },
      });

      if (setActive ?? true) {
        await (tx as any).userWalletAccount.updateMany({
          where: {
            userId,
            walletAddress: { not: walletAddress },
          },
          data: { isActive: false },
        });

        await tx.user.update({
          where: { id: userId },
          data: { walletAddress },
        });
      }
    });

    return true;
  }

  @Mutation(() => PartialSignedTx)
  async requestBookingDeposit(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('bookingId', { type: () => Int }) bookingId: number,
    @Args('clientWallet', { type: () => String, nullable: true }) clientWallet?: string,
  ): Promise<PartialSignedTx> {
    const userId = this.extractUserId(ctx);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        service: true,
        trainer: { include: { user: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.clientId !== userId) {
      throw new ForbiddenException('You can only deposit for your own booking');
    }
    if (isPendingBookingExpired(booking)) {
      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });
      throw new ForbiddenException('This checkout session expired. Please book the slot again.');
    }
    if (booking.status !== BookingStatus.PENDING) {
      throw new ForbiddenException(`Booking must be PENDING before escrow deposit. Current status: ${booking.status}`);
    }

    if (!booking.client.walletAddress) {
      throw new ForbiddenException(
        'Set your wallet address in ReLive before paying with crypto.',
      );
    }
    if (clientWallet && booking.client.walletAddress !== clientWallet) {
      throw new ForbiddenException(
        'Your connected wallet does not match the wallet address saved in ReLive.',
      );
    }
    if (!booking.trainer.user.walletAddress) {
      throw new ForbiddenException('Trainer wallet address is not set');
    }

    if (!booking.service.tokenMintAddress || !booking.service.priceInLamports) {
      throw new ForbiddenException('This service does not support crypto payments');
    }

    const { serializedTx, escrowAddress } = await this.txService.buildInitializeBookingTx({
      bookingId,
      clientWallet: booking.client.walletAddress,
      trainerWallet: booking.trainer.user.walletAddress,
      mint: booking.service.tokenMintAddress,
      amount: booking.service.priceInLamports,
    });

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        escrowAddress,
        paymentType: 'CRYPTO',
        pendingExpiresAt: getPendingBookingExpiresAt(),
      },
    });

    return { serializedTx, bookingId, instruction: 'initialize_booking', escrowAddress };
  }

  @Mutation(() => PartialSignedTx)
  async requestRelease(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('bookingId', { type: () => Int }) bookingId: number,
  ): Promise<PartialSignedTx> {
    const userId = this.extractUserId(ctx);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== Role.TRAINER) {
      throw new ForbiddenException('Only trainers can request fund release');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        service: true,
        trainer: { include: { user: true } },
      },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.trainer.userId !== userId) {
      throw new ForbiddenException('You can only request release for your own trainer bookings');
    }
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new ForbiddenException(`Cannot release funds for booking in status: ${booking.status}`);
    }
    if (!booking.txHash) {
      throw new ForbiddenException('Booking has no confirmed on-chain deposit transaction');
    }
    if (!booking.client.walletAddress || !user.walletAddress) {
      throw new ForbiddenException('Client and trainer wallet addresses must both be set');
    }

    if (!booking.service.tokenMintAddress) {
      throw new ForbiddenException('This service does not support crypto payments');
    }

    const { serializedTx, escrowAddress } = await this.txService.buildReleaseTx({
      bookingId,
      clientWallet: booking.client.walletAddress,
      trainerWallet: user.walletAddress,
      mint: booking.service.tokenMintAddress,
    });
    if (booking.escrowAddress && booking.escrowAddress !== escrowAddress) {
      throw new ForbiddenException('Stored escrow address does not match derived booking PDA');
    }

    return { serializedTx, bookingId, instruction: 'release_funds', escrowAddress };
  }

  @Mutation(() => PartialSignedTx)
  async requestRefund(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('bookingId', { type: () => Int }) bookingId: number,
  ): Promise<PartialSignedTx> {
    const userId = this.extractUserId(ctx);

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true, service: true },
    });

    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.clientId !== userId) {
      throw new ForbiddenException('You can only request refunds on your own bookings');
    }
    if (booking.status !== BookingStatus.CANCELLED) {
      throw new ForbiddenException(`Cannot refund booking in status: ${booking.status}`);
    }
    if (!booking.txHash) {
      throw new ForbiddenException('Booking has no confirmed on-chain deposit transaction');
    }
    if (!booking.client.walletAddress) {
      throw new ForbiddenException('Client wallet address is not set');
    }

    if (!booking.service.tokenMintAddress) {
      throw new ForbiddenException('This service does not support crypto payments');
    }

    const { serializedTx, escrowAddress } = await this.txService.buildRefundTx({
      bookingId,
      clientWallet: booking.client.walletAddress,
      mint: booking.service.tokenMintAddress,
    });
    if (booking.escrowAddress && booking.escrowAddress !== escrowAddress) {
      throw new ForbiddenException('Stored escrow address does not match derived booking PDA');
    }

    return { serializedTx, bookingId, instruction: 'refund_booking', escrowAddress };
  }
}
