import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { createHash } from 'crypto';

const ESCROW_SEED = 'escrow';
const VAULT_SEED = 'vault';
const CONFIG_SEED = 'config';

@Injectable()
export class BlockchainTransactionService {
  private readonly logger = new Logger(BlockchainTransactionService.name);

  constructor(private readonly configService: ConfigService) {}

  async buildInitializeBookingTx(params: {
    bookingId: number;
    clientWallet: string;
    trainerWallet: string;
    mint: string;
    amount: number | bigint | string;
  }): Promise<{ serializedTx: string; escrowAddress: string }> {
    const { connection, programId } = this.getSolanaConfig();
    const client = new PublicKey(params.clientWallet);
    const trainer = new PublicKey(params.trainerWallet);
    const mint = new PublicKey(params.mint);
    const amount = this.toU64(params.amount, 'amount');
    const bookingId = this.toU64(params.bookingId, 'bookingId');

    const { config, escrow, vault } = this.deriveEscrowAccounts(programId, bookingId);
    const clientTokenAccount = getAssociatedTokenAddressSync(mint, client, false);

    const tx = new Transaction().add(
      new TransactionInstruction({
        programId,
        keys: [
          { pubkey: client, isSigner: true, isWritable: true },
          { pubkey: config, isSigner: false, isWritable: false },
          { pubkey: trainer, isSigner: false, isWritable: false },
          { pubkey: mint, isSigner: false, isWritable: false },
          { pubkey: escrow, isSigner: false, isWritable: true },
          { pubkey: vault, isSigner: false, isWritable: true },
          { pubkey: clientTokenAccount, isSigner: false, isWritable: true },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ],
        data: Buffer.concat([
          this.anchorDiscriminator('global:initialize_booking'),
          this.u64Le(bookingId),
          this.u64Le(amount),
        ]),
      }),
    );

    tx.feePayer = client;
    tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;

    this.logger.log(`[Mediator] Built initialize_booking tx | bookingId: ${params.bookingId}`);
    return {
      serializedTx: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
      escrowAddress: escrow.toBase58(),
    };
  }

  async buildReleaseTx(params: {
    bookingId: number;
    clientWallet: string;
    trainerWallet: string;
    mint: string;
  }): Promise<{ serializedTx: string; escrowAddress: string }> {
    const { connection, programId } = this.getSolanaConfig();
    const platformAuthority = this.getPlatformAuthority();
    const trainer = new PublicKey(params.trainerWallet);
    const client = new PublicKey(params.clientWallet);
    const mint = new PublicKey(params.mint);
    const bookingId = this.toU64(params.bookingId, 'bookingId');

    const { config, escrow, vault } = this.deriveEscrowAccounts(programId, bookingId);
    const trainerTokenAccount = getAssociatedTokenAddressSync(mint, trainer, false);

    const tx = new Transaction().add(
      new TransactionInstruction({
        programId,
        keys: [
          { pubkey: config, isSigner: false, isWritable: false },
          { pubkey: platformAuthority.publicKey, isSigner: true, isWritable: false },
          { pubkey: trainer, isSigner: true, isWritable: true },
          { pubkey: client, isSigner: false, isWritable: true },
          { pubkey: escrow, isSigner: false, isWritable: true },
          { pubkey: vault, isSigner: false, isWritable: true },
          { pubkey: trainerTokenAccount, isSigner: false, isWritable: true },
          { pubkey: mint, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: this.anchorDiscriminator('global:release_funds'),
      }),
    );

    tx.feePayer = trainer;
    tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
    tx.partialSign(platformAuthority);

    this.logger.log(`[Mediator] Built release_funds tx | bookingId: ${params.bookingId}`);
    return {
      serializedTx: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
      escrowAddress: escrow.toBase58(),
    };
  }

  async buildRefundTx(params: {
    bookingId: number;
    clientWallet: string;
    mint: string;
  }): Promise<{ serializedTx: string; escrowAddress: string }> {
    const { connection, programId } = this.getSolanaConfig();
    const platformAuthority = this.getPlatformAuthority();
    const client = new PublicKey(params.clientWallet);
    const mint = new PublicKey(params.mint);
    const bookingId = this.toU64(params.bookingId, 'bookingId');

    const { config, escrow, vault } = this.deriveEscrowAccounts(programId, bookingId);
    const clientTokenAccount = getAssociatedTokenAddressSync(mint, client, false);

    const tx = new Transaction().add(
      new TransactionInstruction({
        programId,
        keys: [
          { pubkey: config, isSigner: false, isWritable: false },
          { pubkey: platformAuthority.publicKey, isSigner: true, isWritable: false },
          { pubkey: client, isSigner: true, isWritable: true },
          { pubkey: escrow, isSigner: false, isWritable: true },
          { pubkey: vault, isSigner: false, isWritable: true },
          { pubkey: clientTokenAccount, isSigner: false, isWritable: true },
          { pubkey: mint, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        ],
        data: this.anchorDiscriminator('global:refund_booking'),
      }),
    );

    tx.feePayer = client;
    tx.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash;
    tx.partialSign(platformAuthority);

    this.logger.log(`[Mediator] Built refund_booking tx | bookingId: ${params.bookingId}`);
    return {
      serializedTx: tx.serialize({ requireAllSignatures: false, verifySignatures: false }).toString('base64'),
      escrowAddress: escrow.toBase58(),
    };
  }

  deriveEscrowAddress(bookingId: number): string {
    const { programId } = this.getSolanaConfig();
    const id = this.toU64(bookingId, 'bookingId');
    return this.deriveEscrowAccounts(programId, id).escrow.toBase58();
  }

  private getSolanaConfig() {
    const rpcUrl = this.configService.get<string>('SOLANA_RPC_URL');
    const programId = this.configService.get<string>('ESCROW_PROGRAM_ID');

    if (!rpcUrl || !programId) {
      throw new BadRequestException('SOLANA_RPC_URL and ESCROW_PROGRAM_ID must be configured');
    }

    return {
      connection: new Connection(rpcUrl, 'confirmed'),
      programId: new PublicKey(programId),
    };
  }

  private getPlatformAuthority(): Keypair {
    const rawSecret = this.configService.get<string>('PLATFORM_AUTHORITY_SECRET');
    if (!rawSecret) {
      throw new BadRequestException('PLATFORM_AUTHORITY_SECRET must be configured');
    }

    const trimmed = rawSecret.trim();
    let bytes: number[];

    try {
      if (trimmed.startsWith('[')) {
        bytes = JSON.parse(trimmed);
      } else if (trimmed.includes(',')) {
        bytes = trimmed.split(',').map((value) => Number(value.trim()));
      } else {
        bytes = Array.from(Buffer.from(trimmed, 'base64'));
      }
    } catch {
      throw new BadRequestException(
        'PLATFORM_AUTHORITY_SECRET must be a JSON array, comma-separated byte list, or base64 secret key',
      );
    }

    if (bytes.length !== 64 || bytes.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) {
      throw new BadRequestException('PLATFORM_AUTHORITY_SECRET must decode to a 64-byte Solana keypair');
    }

    return Keypair.fromSecretKey(Uint8Array.from(bytes));
  }

  private deriveEscrowAccounts(programId: PublicKey, bookingId: bigint) {
    const [config] = PublicKey.findProgramAddressSync([Buffer.from(CONFIG_SEED)], programId);
    const [escrow] = PublicKey.findProgramAddressSync(
      [Buffer.from(ESCROW_SEED), this.u64Le(bookingId)],
      programId,
    );
    const [vault] = PublicKey.findProgramAddressSync(
      [Buffer.from(VAULT_SEED), escrow.toBuffer()],
      programId,
    );

    return { config, escrow, vault };
  }

  private anchorDiscriminator(namespace: string): Buffer {
    return createHash('sha256').update(namespace).digest().subarray(0, 8);
  }

  private u64Le(value: bigint): Buffer {
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64LE(value);
    return buffer;
  }

  private toU64(value: number | bigint | string, name: string): bigint {
    let parsed: bigint;
    try {
      parsed = BigInt(value);
    } catch {
      throw new BadRequestException(`${name} must be an integer`);
    }
    if (parsed < 0n || parsed > 18_446_744_073_709_551_615n) {
      throw new BadRequestException(`${name} must fit in u64`);
    }
    return parsed;
  }
}
