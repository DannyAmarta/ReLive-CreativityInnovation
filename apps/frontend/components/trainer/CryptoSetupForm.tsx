"use client";

import { useActionState, useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Coins, ExternalLink, Save, Wallet } from "lucide-react";
import {
  CryptoSettingsFormState,
  updateTrainerCryptoSettingsAction,
} from "@/lib/actions/marketplace";

const initialState: CryptoSettingsFormState = { error: null };

export function CryptoSetupForm({
  walletAddress,
  payoutMintAddress,
}: {
  walletAddress?: string | null;
  payoutMintAddress?: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    updateTrainerCryptoSettingsAction,
    initialState,
  );
  const [walletValue, setWalletValue] = useState(state.fields?.walletAddress ?? walletAddress ?? "");
  const [mintValue, setMintValue] = useState(
    state.fields?.payoutMintAddress ?? payoutMintAddress ?? "",
  );

  useEffect(() => {
    setWalletValue(state.fields?.walletAddress ?? walletAddress ?? "");
  }, [state.fields?.walletAddress, walletAddress]);

  useEffect(() => {
    setMintValue(state.fields?.payoutMintAddress ?? payoutMintAddress ?? "");
  }, [state.fields?.payoutMintAddress, payoutMintAddress]);

  return (
    <section className="glass-card-elevated overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold">Crypto wallet activation</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Save the Solana payout wallet address and default token mint your crypto-priced services
          should use.
        </p>
      </div>

      <div className="space-y-5 p-5">
        {state.error && (
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
          Trainer crypto setup uses the wallet address saved in your ReLive profile. You do not
          need to connect a wallet extension here unless you want to test client-side crypto
          payments separately.
        </div>

        <form action={formAction} className="grid gap-4">
          <label className="space-y-1.5 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Wallet className="size-4" />
              Trainer wallet address
            </span>
            <input
              name="walletAddress"
              required
              disabled={isPending}
              value={walletValue}
              onChange={(event) => setWalletValue(event.target.value)}
              placeholder="Paste your Solana wallet address"
              className="h-11 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm outline-none focus:border-primary disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              This is the public payout destination ReLive will use for trainer-side crypto flows.
            </p>
          </label>

          <label className="space-y-1.5 text-sm">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <Coins className="size-4" />
              Default token mint address
            </span>
            <input
              name="payoutMintAddress"
              required
              disabled={isPending}
              value={mintValue}
              onChange={(event) => setMintValue(event.target.value)}
              placeholder="Paste the token mint your services should use"
              className="h-11 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm outline-none focus:border-primary disabled:opacity-50"
            />
            <p className="text-xs text-muted-foreground">
              New crypto-priced services can inherit this mint automatically. Use a mint that
              matches the same network as the app environment.
            </p>
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
            >
              <Save className="mr-1.5 size-4" />
              {isPending ? "Saving..." : "Save crypto settings"}
            </button>
            <a
              href="https://phantom.app/download"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-border px-4 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary-deep"
            >
              Get a wallet <ExternalLink className="size-3.5" />
            </a>
          </div>
        </form>

        <div className="rounded-2xl border border-[rgba(74,93,62,0.15)] bg-[rgba(74,93,62,0.03)] p-4 text-sm text-[#67715f]">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#4a5d3e]" />
            <div className="space-y-1">
              <p className="font-medium text-[#4a5d3e]">Before you activate crypto</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Make sure the saved payout wallet address is correct for this trainer profile, and
                make sure any crypto-priced service has a token mint configured in the service
                editor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
