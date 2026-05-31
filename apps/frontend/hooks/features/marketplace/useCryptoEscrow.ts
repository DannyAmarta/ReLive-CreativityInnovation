"use client";

import { useState, useCallback } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { authFetchGraphql } from "@/lib/fetchGraphQL";
import { print } from "graphql";
import {
  REQUEST_BOOKING_DEPOSIT_MUTATION,
  REQUEST_RELEASE_MUTATION,
  REQUEST_REFUND_MUTATION,
} from "@/lib/gqlQueries";

type EscrowAction = "deposit" | "release" | "refund";

interface UseCryptoEscrowResult {
  execute: (bookingId: number, action: EscrowAction) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

export function useCryptoEscrow(): UseCryptoEscrowResult {
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (bookingId: number, action: EscrowAction): Promise<string | null> => {
      if (!connected || !publicKey || !signTransaction) {
        setError("Wallet not connected. Please connect your wallet first.");
        return null;
      }

      setIsLoading(true);
      setError(null);

      try {
        // 1. Get the partially-signed serialized transaction from backend
        let mutation: any;
        let mutationKey: string;

        if (action === "deposit") {
          mutation = REQUEST_BOOKING_DEPOSIT_MUTATION;
          mutationKey = "requestBookingDeposit";
        } else if (action === "release") {
          mutation = REQUEST_RELEASE_MUTATION;
          mutationKey = "requestRelease";
        } else {
          mutation = REQUEST_REFUND_MUTATION;
          mutationKey = "requestRefund";
        }

        const variables: any = { bookingId };
        if (action === "deposit") {
          variables.clientWallet = publicKey.toBase58();
        }

        const data = await authFetchGraphql<{ [key: string]: { serializedTx: string } }>(
          print(mutation),
          variables
        );

        const serializedTx = data?.[mutationKey]?.serializedTx;
        if (!serializedTx) throw new Error("Backend did not return a transaction.");

        // 2. Deserialize the transaction
        const txBuffer = Buffer.from(serializedTx, "base64");
        const transaction = Transaction.from(txBuffer);

        // 3. Get recent blockhash (only for deposit; backend pre-signs release/refund)
        if (action === "deposit") {
          const { blockhash } = await connection.getLatestBlockhash("confirmed");
          transaction.recentBlockhash = blockhash;
          transaction.feePayer = publicKey;
        }

        // 4. User signs
        const signed = await signTransaction(transaction);

        // 5. Broadcast
        const signature = await connection.sendRawTransaction(signed.serialize(), {
          skipPreflight: false,
          preflightCommitment: "confirmed",
        });

        // 6. Confirm
        await connection.confirmTransaction(signature, "confirmed");

        return signature;
      } catch (err: any) {
        const message =
          err?.message?.includes("User rejected")
            ? "Transaction cancelled by user."
            : err?.message ?? "An unknown error occurred during the transaction.";
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [connected, publicKey, signTransaction, connection]
  );

  return { execute, isLoading, error };
}
