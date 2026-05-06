import { Args, Context, Int, Mutation, Resolver } from '@nestjs/graphql';
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

  @Mutation(() => PartialSignedTx)
  async requestBookingDeposit(
    @Context() ctx: { req: { headers: Record<string, string> } },
    @Args('bookingId', { type: () => Int }) bookingId: number,
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
    if (booking.status !== BookingStatus.PENDING) {
      throw new ForbiddenException(`Booking must be PENDING before escrow deposit. Current status: ${booking.status}`);
    }
    if (!booking.client.walletAddress) {
      throw new ForbiddenException('Client wallet address is not set');
    }
    if (!booking.trainer.user.walletAddress) {
      throw new ForbiddenException('Trainer wallet address is not set');
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
      data: { escrowAddress },
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
