import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, Role } from '@prisma/client';
import { calculateDuitkuFee, generateSignature, normalizePhoneNumber } from './fiat-payment.utils';
import { DuitkuCreateInvoiceResponse, DuitkuDisbursementResponse } from './fiat-payment.types';
import { DuitkuWebhookPayload } from './dto/duitku-webhook-payload.dto';
import { CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Injectable()
export class FiatPaymentService {
  private readonly logger = new Logger(FiatPaymentService.name);
  private readonly sandboxMode: boolean;
  private readonly apiUrl: string;
  private readonly merchantCode: string;
  private readonly apiKey: string;
  private readonly callbackUrl: string;
  private readonly returnUrl: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.sandboxMode = this.configService.get<string>('DUITKU_SANDBOX_MODE') === 'true';
    this.apiUrl = this.sandboxMode
      ? 'https://sandbox.duitku.com/webapi/api/merchant/v2'
      : 'https://passport.duitku.com/webapi/api/merchant/v2';
    this.merchantCode = this.configService.getOrThrow<string>('DUITKU_MERCHANT_CODE');
    this.apiKey = this.configService.getOrThrow<string>('DUITKU_API_KEY');
    this.callbackUrl = this.configService.getOrThrow<string>('DUITKU_CALLBACK_URL');
    this.returnUrl = this.configService.getOrThrow<string>('DUITKU_RETURN_URL');
  }

  // ─── FIX #1: All service methods now accept `CurrentUserPayload` instead of
  // a raw `userId`. The resolver passes the pre-validated user from @CurrentUser(),
  // so there is zero redundant DB fetching. ────────────────────────────────────

  async createDeposit(user: CurrentUserPayload, bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true, service: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.clientId !== user.id) throw new BadRequestException('Not your booking');
    if (booking.status !== BookingStatus.PENDING) throw new BadRequestException('Booking not pending');
    if (!booking.service.priceInIdr) throw new BadRequestException('Service has no IDR price');

    const amount = booking.service.priceInIdr;
    const fee = calculateDuitkuFee(amount);
    const total = amount + fee;
    const merchantOrderId = `BOOK-${bookingId}-${Date.now()}`;

    const clientEmail = booking.client.email;
    const clientPhone = booking.client.phone ? normalizePhoneNumber(booking.client.phone) : '08123456789';

    const requestBody = {
      merchantCode: this.merchantCode,
      paymentAmount: total,
      paymentMethod: 'VC', // Virtual Account - can be made dynamic later
      merchantOrderId,
      productDetails: `Booking #${bookingId} - ${booking.service.title}`,
      email: clientEmail,
      phone: clientPhone,
      callbackUrl: this.callbackUrl,
      returnUrl: this.returnUrl,
      signature: generateSignature(this.merchantCode, total, merchantOrderId, this.apiKey),
    };

    const response = await fetch(`${this.apiUrl}/inquiry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    const json = (await response.json()) as DuitkuCreateInvoiceResponse;
    if (!response.ok || json.resultCode !== '00') {
      throw new BadRequestException(json.resultMessage || 'Failed to create payment');
    }

    // Create payment transaction record
    const paymentTx = await this.prisma.paymentTransaction.create({
      data: {
        bookingId,
        gateway: 'DUITKU',
        gatewayTxId: json.reference,
        amountIdr: total,
        feeIdr: fee,
        status: 'PENDING',
      },
    });

    // Update booking with fiat fields
    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentType: 'FIAT',
        fiatAmount: total,
        servicePriceIdr: amount,
        processingFeeIdr: fee,
        gatewayTxId: json.reference,
      },
    });

    return {
      paymentUrl: json.paymentUrl,
      transactionId: paymentTx.id,
      bookingId,
      totalAmount: total,
      fee,
    };
  }

  // ─── FIX #4: Webhook now validates that the paid amount matches what we
  // expected, preventing partial-payment exploits. ─────────────────────────────

  async processWebhook(payload: DuitkuWebhookPayload) {
    const { merchantOrderId, amount, resultCode, reference, paymentMethod, transactionId } = payload;

    // Find payment transaction by gatewayTxId = reference
    const paymentTx = await this.prisma.paymentTransaction.findUnique({
      where: { gatewayTxId: reference },
    });

    if (!paymentTx) {
      this.logger.warn(`Webhook for unknown reference: ${reference}`);
      return { received: true };
    }

    if (paymentTx.status === 'SUCCESS') {
      this.logger.log(`Duplicate webhook for transaction ${reference}, ignoring.`);
      return { received: true };
    }

    // FIX #4: Verify the paid amount matches the expected amount.
    // Without this check, an attacker could pay 10 IDR on a 500,000 IDR booking
    // and the system would blindly activate it.
    if (Number(amount) !== paymentTx.amountIdr) {
      this.logger.error(
        `Amount mismatch for reference ${reference}: expected ${paymentTx.amountIdr}, got ${amount}`,
      );
      await this.prisma.paymentTransaction.update({
        where: { id: paymentTx.id },
        data: {
          status: 'FAILURE',
          rawPayload: payload as any,
        },
      });
      return { received: true };
    }

    if (resultCode === '00') {
      // Success
      await this.prisma.$transaction(async (tx) => {
        await tx.paymentTransaction.update({
          where: { id: paymentTx.id },
          data: {
            status: 'SUCCESS',
            rawPayload: payload as any,
          },
        });
        await tx.booking.update({
          where: { id: paymentTx.bookingId },
          data: {
            status: BookingStatus.ACTIVE,
            gatewayPaymentMethod: paymentMethod,
            webhookReceivedAt: new Date(),
          },
        });
      });
      this.logger.log(`Booking ${paymentTx.bookingId} activated via webhook`);
    } else {
      // Failure
      await this.prisma.paymentTransaction.update({
        where: { id: paymentTx.id },
        data: {
          status: 'FAILURE',
          rawPayload: payload as any,
        },
      });
      this.logger.warn(`Payment failed for booking ${paymentTx.bookingId}: ${resultCode}`);
    }
    return { received: true };
  }

  // ─── FIX #2: Credit trainer's FiatWallet when a fiat booking is completed.
  // This is called by TrainerService.updateBookingStatus when transitioning
  // a FIAT booking from ACTIVE → COMPLETED. ────────────────────────────────────

  async creditTrainerOnCompletion(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true, trainer: true },
    });

    if (!booking || booking.paymentType !== 'FIAT' || !booking.servicePriceIdr) {
      return; // Not a fiat booking or no IDR price — nothing to credit
    }

    const trainerId = booking.trainer.userId;
    const creditAmount = booking.servicePriceIdr; // Base price, excluding processing fee

    await this.prisma.$transaction(async (tx) => {
      // Upsert the wallet (auto-creates if it doesn't exist yet)
      await tx.fiatWallet.upsert({
        where: { trainerId },
        create: { trainerId, balanceIdr: creditAmount },
        update: { balanceIdr: { increment: creditAmount } },
      });
    });

    this.logger.log(
      `Credited ${creditAmount} IDR to trainer ${trainerId} for booking ${bookingId}`,
    );
  }

  // ─── FIX #3: Withdrawal now deducts balance BEFORE calling the external API.
  // If the Duitku disbursement fails, we refund the balance. This eliminates
  // the double-spend race condition (TOCTOU). ──────────────────────────────────

  async requestWithdrawal(user: CurrentUserPayload, input: any) {
    if (user.role !== Role.TRAINER) {
      throw new BadRequestException('Only trainers can withdraw');
    }

    // Step 1: Atomically deduct balance FIRST (prevents double-spend)
    // We use a raw Prisma transaction with a conditional update to ensure
    // the balance is sufficient at the exact moment of deduction.
    const updatedWallets = await this.prisma.$executeRaw`
      UPDATE "FiatWallet"
      SET "balanceIdr" = "balanceIdr" - ${input.amountIdr},
          "updatedAt" = NOW()
      WHERE "trainerId" = ${user.id}
        AND "balanceIdr" >= ${input.amountIdr}
    `;

    if (updatedWallets === 0) {
      throw new BadRequestException('Insufficient balance');
    }

    // Step 2: Create withdrawal request record
    const withdrawal = await this.prisma.withdrawalRequest.create({
      data: {
        trainerId: user.id,
        amountIdr: input.amountIdr,
        bankCode: input.bankCode,
        accountNumber: input.accountNumber,
        accountName: input.accountName,
        paymentMethod: input.paymentMethod,
        status: 'PROCESSING', // Already deducted, now processing externally
      },
    });

    // Step 3: Call Duitku disbursement
    const disbursementBody = {
      merchantCode: this.merchantCode,
      reference: `WITHDRAW-${withdrawal.id}`,
      amount: input.amountIdr,
      bankCode: input.bankCode,
      accountNumber: input.accountNumber,
      accountName: input.accountName,
      signature: generateSignature(this.merchantCode, input.amountIdr, `WITHDRAW-${withdrawal.id}`, this.apiKey),
    };

    try {
      const response = await fetch(`${this.apiUrl}/disbursement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(disbursementBody),
      });
      const json = (await response.json()) as DuitkuDisbursementResponse;

      if (response.ok && json.status === '00') {
        await this.prisma.withdrawalRequest.update({
          where: { id: withdrawal.id },
          data: {
            status: 'COMPLETED',
            gatewayReference: json.referenceId,
            processedAt: new Date(),
          },
        });
        return this.prisma.withdrawalRequest.findUnique({ where: { id: withdrawal.id } });
      } else {
        // Disbursement failed — refund the balance
        await this.prisma.$transaction(async (tx) => {
          await tx.withdrawalRequest.update({
            where: { id: withdrawal.id },
            data: {
              status: 'FAILED',
              failureReason: json.message,
              processedAt: new Date(),
            },
          });
          await tx.fiatWallet.update({
            where: { trainerId: user.id },
            data: { balanceIdr: { increment: input.amountIdr } },
          });
        });
        throw new BadRequestException(json.message || 'Disbursement failed');
      }
    } catch (error) {
      // Network error or unexpected crash — refund the balance
      if (!(error instanceof BadRequestException)) {
        await this.prisma.$transaction(async (tx) => {
          await tx.withdrawalRequest.update({
            where: { id: withdrawal.id },
            data: { status: 'FAILED', failureReason: (error as Error).message },
          });
          await tx.fiatWallet.update({
            where: { trainerId: user.id },
            data: { balanceIdr: { increment: input.amountIdr } },
          });
        });
      }
      throw error;
    }
  }

  // ─── FIX #6: Admin refund now branches on sandboxMode. In production it
  // would call the Duitku refund endpoint. In sandbox it only updates DB. ──────

  async adminRefund(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { client: true, service: true, paymentTransactions: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.paymentType !== 'FIAT') throw new BadRequestException('Not a fiat booking');
    if (booking.status !== BookingStatus.ACTIVE) throw new BadRequestException('Booking not active');

    // Find the successful payment transaction for refund
    const successTx = booking.paymentTransactions.find(tx => tx.status === 'SUCCESS');

    if (!this.sandboxMode && successTx) {
      // ── Production: Call Duitku refund API ──
      // TODO: Implement actual Duitku refund endpoint call when production
      // credentials are available. The refund body would include:
      //   merchantCode, reference (gatewayTxId), amount, bankCode, etc.
      // For now, log a warning so this is not silently skipped in production.
      this.logger.warn(
        `PRODUCTION REFUND NOT IMPLEMENTED: Booking ${bookingId} refund of ${booking.fiatAmount} IDR ` +
        `requires manual processing via Duitku dashboard (ref: ${successTx.gatewayTxId})`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });
      await tx.paymentTransaction.updateMany({
        where: { bookingId },
        data: { status: 'REFUNDED' },
      });
    });

    return this.prisma.booking.findUnique({ where: { id: bookingId } });
  }

  // ─── FIX #7 (partial): Refund logic that can be called from TrainerService
  // when a fiat booking is cancelled via the state machine. ────────────────────

  async handleFiatBookingCancellation(bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { paymentTransactions: true },
    });

    if (!booking || booking.paymentType !== 'FIAT') {
      return; // Not a fiat booking — nothing to do
    }

    const successTx = booking.paymentTransactions.find(tx => tx.status === 'SUCCESS');
    if (!successTx) {
      return; // No successful payment to refund
    }

    if (!this.sandboxMode) {
      this.logger.warn(
        `PRODUCTION REFUND NOT IMPLEMENTED: Fiat booking ${bookingId} cancelled. ` +
        `Manual refund required via Duitku dashboard (ref: ${successTx.gatewayTxId})`,
      );
    }

    // Mark payment transactions as refunded
    await this.prisma.paymentTransaction.updateMany({
      where: { bookingId },
      data: { status: 'REFUNDED' },
    });

    this.logger.log(`Fiat payment transactions for booking ${bookingId} marked as REFUNDED`);
  }

  // ─── FIX #5: getWallet now uses upsert instead of find+create to prevent
  // P2002 unique constraint crashes from concurrent requests. ──────────────────

  async getWallet(user: CurrentUserPayload) {
    if (user.role !== Role.TRAINER) {
      throw new BadRequestException('Only trainers have fiat wallets');
    }

    return this.prisma.fiatWallet.upsert({
      where: { trainerId: user.id },
      create: { trainerId: user.id, balanceIdr: 0 },
      update: {}, // No-op update, just return existing
    });
  }
}