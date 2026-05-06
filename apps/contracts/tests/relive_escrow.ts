import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { ReliveEscrow } from '../target/types/relive_escrow';
import {
  createAssociatedTokenAccount,
  createMint,
  getAccount,
  mintTo,
} from '@solana/spl-token';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from '@solana/web3.js';
import { assert } from 'chai';

describe('relive_escrow', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.ReliveEscrow as Program<ReliveEscrow>;

  const platformAuthority = Keypair.generate();
  const rogueAuthority = Keypair.generate();
  const clientKeypair = Keypair.generate();
  const trainerKeypair = Keypair.generate();

  let mint: PublicKey;
  let clientAta: PublicKey;
  let trainerAta: PublicKey;

  const BOOKING_ID = new anchor.BN(1001);
  const REFUND_BOOKING_ID = new anchor.BN(2002);
  const DEPOSIT_AMOUNT = new anchor.BN(10_000_000);

  const getConfigPda = () =>
    PublicKey.findProgramAddressSync([Buffer.from('config')], program.programId);

  const getEscrowPda = (bookingId: anchor.BN) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from('escrow'), bookingId.toArrayLike(Buffer, 'le', 8)],
      program.programId,
    );

  const getVaultPda = (escrowKey: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), escrowKey.toBuffer()],
      program.programId,
    );

  const sendAsUserFeePayer = async (tx: Transaction, feePayer: Keypair, extraSigners: Keypair[]) => {
    tx.feePayer = feePayer.publicKey;
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    tx.partialSign(...extraSigners, feePayer);
    const signature = await provider.connection.sendRawTransaction(tx.serialize());
    await provider.connection.confirmTransaction(signature);
    return signature;
  };

  before(async () => {
    for (const kp of [platformAuthority, rogueAuthority, clientKeypair, trainerKeypair]) {
      const sig = await provider.connection.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(sig);
    }

    const [configPda] = getConfigPda();
    await program.methods
      .initializeConfig()
      .accounts({
        platformAuthority: platformAuthority.publicKey,
        config: configPda,
      })
      .signers([platformAuthority])
      .rpc();

    mint = await createMint(
      provider.connection,
      platformAuthority,
      platformAuthority.publicKey,
      null,
      6,
    );

    clientAta = await createAssociatedTokenAccount(
      provider.connection,
      clientKeypair,
      mint,
      clientKeypair.publicKey,
    );

    await mintTo(
      provider.connection,
      platformAuthority,
      mint,
      clientAta,
      platformAuthority,
      100_000_000,
    );

    trainerAta = await createAssociatedTokenAccount(
      provider.connection,
      trainerKeypair,
      mint,
      trainerKeypair.publicKey,
    );
  });

  it('client deposits tokens into escrow and pays network fees', async () => {
    const [configPda] = getConfigPda();
    const [escrowPda] = getEscrowPda(BOOKING_ID);
    const [vaultPda] = getVaultPda(escrowPda);

    const clientBalanceBefore = await provider.connection.getBalance(clientKeypair.publicKey);
    const platformBalanceBefore = await provider.connection.getBalance(platformAuthority.publicKey);

    const tx = await program.methods
      .initializeBooking(BOOKING_ID, DEPOSIT_AMOUNT)
      .accounts({
        client: clientKeypair.publicKey,
        config: configPda,
        trainer: trainerKeypair.publicKey,
        mint,
        escrow: escrowPda,
        vault: vaultPda,
        clientTokenAccount: clientAta,
      })
      .transaction();

    await sendAsUserFeePayer(tx, clientKeypair, []);

    const escrow = await program.account.escrowAccount.fetch(escrowPda);
    assert.equal(escrow.client.toBase58(), clientKeypair.publicKey.toBase58());
    assert.equal(escrow.trainer.toBase58(), trainerKeypair.publicKey.toBase58());
    assert.equal(escrow.amount.toString(), DEPOSIT_AMOUNT.toString());

    const vault = await getAccount(provider.connection, vaultPda);
    assert.equal(vault.amount.toString(), DEPOSIT_AMOUNT.toString());

    const clientBalanceAfter = await provider.connection.getBalance(clientKeypair.publicKey);
    const platformBalanceAfter = await provider.connection.getBalance(platformAuthority.publicKey);
    assert(clientBalanceAfter < clientBalanceBefore, 'client paid gas and rent');
    assert.equal(platformBalanceAfter, platformBalanceBefore, 'platform did not subsidize deposit');
  });

  it('rejects duplicate booking ids at the PDA layer', async () => {
    const [configPda] = getConfigPda();
    const [escrowPda] = getEscrowPda(BOOKING_ID);
    const [vaultPda] = getVaultPda(escrowPda);

    try {
      const tx = await program.methods
        .initializeBooking(BOOKING_ID, DEPOSIT_AMOUNT)
        .accounts({
          client: clientKeypair.publicKey,
          config: configPda,
          trainer: trainerKeypair.publicKey,
          mint,
          escrow: escrowPda,
          vault: vaultPda,
          clientTokenAccount: clientAta,
        })
        .transaction();
      await sendAsUserFeePayer(tx, clientKeypair, []);
      assert.fail('duplicate booking id should fail');
    } catch (err: any) {
      assert(
        err.message.includes('already in use') ||
          err.logs?.some((line: string) => line.includes('already in use')),
      );
    }
  });

  it('rejects release without the configured platform authority', async () => {
    const [configPda] = getConfigPda();
    const [escrowPda] = getEscrowPda(BOOKING_ID);
    const [vaultPda] = getVaultPda(escrowPda);

    try {
      const tx = await program.methods
        .releaseFunds()
        .accounts({
          config: configPda,
          platformAuthority: rogueAuthority.publicKey,
          trainer: trainerKeypair.publicKey,
          client: clientKeypair.publicKey,
          escrow: escrowPda,
          vault: vaultPda,
          trainerTokenAccount: trainerAta,
          mint,
        })
        .transaction();
      await sendAsUserFeePayer(tx, trainerKeypair, [rogueAuthority]);
      assert.fail('rogue platform authority should fail');
    } catch (err: any) {
      assert(err.message.includes('InvalidPlatformAuthority') || err.logs?.join('\n').includes('InvalidPlatformAuthority'));
    }
  });

  it('platform partially signs release, trainer broadcasts and pays gas', async () => {
    const [configPda] = getConfigPda();
    const [escrowPda] = getEscrowPda(BOOKING_ID);
    const [vaultPda] = getVaultPda(escrowPda);

    const trainerSolBefore = await provider.connection.getBalance(trainerKeypair.publicKey);
    const platformSolBefore = await provider.connection.getBalance(platformAuthority.publicKey);
    const trainerTokensBefore = (await getAccount(provider.connection, trainerAta)).amount;

    const tx = await program.methods
      .releaseFunds()
      .accounts({
        config: configPda,
        platformAuthority: platformAuthority.publicKey,
        trainer: trainerKeypair.publicKey,
        client: clientKeypair.publicKey,
        escrow: escrowPda,
        vault: vaultPda,
        trainerTokenAccount: trainerAta,
        mint,
      })
      .transaction();

    tx.feePayer = trainerKeypair.publicKey;
    tx.recentBlockhash = (await provider.connection.getLatestBlockhash()).blockhash;
    tx.partialSign(platformAuthority);
    tx.partialSign(trainerKeypair);
    const signature = await provider.connection.sendRawTransaction(tx.serialize());
    await provider.connection.confirmTransaction(signature);

    const trainerTokensAfter = (await getAccount(provider.connection, trainerAta)).amount;
    assert.equal((trainerTokensAfter - trainerTokensBefore).toString(), DEPOSIT_AMOUNT.toString());

    const trainerSolAfter = await provider.connection.getBalance(trainerKeypair.publicKey);
    const platformSolAfter = await provider.connection.getBalance(platformAuthority.publicKey);
    assert(trainerSolAfter < trainerSolBefore, 'trainer paid release gas');
    assert.equal(platformSolAfter, platformSolBefore, 'platform did not pay release gas');

    try {
      await program.account.escrowAccount.fetch(escrowPda);
      assert.fail('escrow account should be closed');
    } catch {
      // Expected.
    }

    try {
      await getAccount(provider.connection, vaultPda);
      assert.fail('vault token account should be closed');
    } catch {
      // Expected.
    }
  });

  it('platform partially signs refund, client broadcasts and receives tokens', async () => {
    const [configPda] = getConfigPda();
    const [escrowPda] = getEscrowPda(REFUND_BOOKING_ID);
    const [vaultPda] = getVaultPda(escrowPda);

    const initTx = await program.methods
      .initializeBooking(REFUND_BOOKING_ID, DEPOSIT_AMOUNT)
      .accounts({
        client: clientKeypair.publicKey,
        config: configPda,
        trainer: trainerKeypair.publicKey,
        mint,
        escrow: escrowPda,
        vault: vaultPda,
        clientTokenAccount: clientAta,
      })
      .transaction();
    await sendAsUserFeePayer(initTx, clientKeypair, []);

    const clientTokensBefore = (await getAccount(provider.connection, clientAta)).amount;
    const platformSolBefore = await provider.connection.getBalance(platformAuthority.publicKey);

    const refundTx = await program.methods
      .refundBooking()
      .accounts({
        config: configPda,
        platformAuthority: platformAuthority.publicKey,
        client: clientKeypair.publicKey,
        escrow: escrowPda,
        vault: vaultPda,
        clientTokenAccount: clientAta,
        mint,
      })
      .transaction();

    await sendAsUserFeePayer(refundTx, clientKeypair, [platformAuthority]);

    const clientTokensAfter = (await getAccount(provider.connection, clientAta)).amount;
    assert.equal((clientTokensAfter - clientTokensBefore).toString(), DEPOSIT_AMOUNT.toString());

    const platformSolAfter = await provider.connection.getBalance(platformAuthority.publicKey);
    assert.equal(platformSolAfter, platformSolBefore, 'platform did not pay refund gas');
  });
});
