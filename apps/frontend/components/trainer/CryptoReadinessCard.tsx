import Link from "next/link";
import { AlertTriangle, CheckCircle2, Coins, Wallet } from "lucide-react";
import type { TrainerProfileRecord } from "@/lib/marketplace";
import {
  getTrainerCryptoReadiness,
  getTrainerCryptoWarningCopy,
} from "@/lib/trainerCrypto";

export function CryptoReadinessCard({
  profile,
}: {
  profile: TrainerProfileRecord | null;
}) {
  const readiness = getTrainerCryptoReadiness(profile);
  const missing = getTrainerCryptoWarningCopy(readiness);

  return (
    <section className="glass-card-elevated overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-full bg-primary/10 text-primary">
            <Wallet className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Crypto wallet system</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Readiness for Solana and token-based bookings.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-background/70 p-4">
          {readiness.isReady ? (
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
          )}
          <div className="space-y-1">
            <p className="text-sm font-semibold text-primary-deep">
              {readiness.isReady ? "Crypto bookings are ready" : "Crypto setup is incomplete"}
            </p>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {readiness.isReady
                ? `You have ${readiness.cryptoReadyServiceCount} active service${readiness.cryptoReadyServiceCount === 1 ? "" : "s"} ready for crypto checkout.`
                : `Complete ${missing.join(", ")} before clients can reliably book you with crypto.`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Wallet</p>
            <p className="mt-2 font-semibold text-primary-deep">
              {profile?.user?.walletAddress ? "Configured" : "Missing"}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background/70 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Mint</p>
            <p className="mt-2 font-semibold text-primary-deep">
              {profile?.payoutMintAddress ? "Configured" : "Missing"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background/70 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Crypto-ready services
              </p>
              <p className="mt-2 text-lg font-semibold text-primary-deep">
                {readiness.cryptoReadyServiceCount}
              </p>
            </div>
            <Coins className="size-5 text-primary" />
          </div>
        </div>

        <Link
          href="/trainer/crypto"
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {readiness.isReady ? "Manage Crypto Setup" : "Finish Crypto Setup"}
        </Link>
      </div>
    </section>
  );
}
