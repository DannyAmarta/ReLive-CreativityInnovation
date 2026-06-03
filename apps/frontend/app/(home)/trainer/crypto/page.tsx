import Link from "next/link";
import { ArrowLeft, CheckCircle2, Coins, ExternalLink, Info, TriangleAlert, Wallet } from "lucide-react";
import { SessionWarning } from "@/components/auth/SessionWarning";
import { TrainerNavigationHeader } from "@/components/trainer/TrainerNavigationHeader";
import { PageHeader } from "@/components/trainer/PageHeader";
import { CryptoSetupForm } from "@/components/trainer/CryptoSetupForm";
import { getMyTrainerProfile, lamportsToTokenUnits } from "@/lib/marketplace";
import { isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { formatUSDC } from "@/lib/format";
import { getTrainerCryptoReadiness } from "@/lib/trainerCrypto";

export default async function TrainerCryptoPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const trainerProfileResult = await Promise.allSettled([getMyTrainerProfile()]);
  const profile =
    trainerProfileResult[0].status === "fulfilled" ? trainerProfileResult[0].value : null;
  const params = searchParams ? await searchParams : {};
  const showSessionWarning =
    params?.session === "expired" ||
    (trainerProfileResult[0].status === "rejected" &&
      isAuthenticationGraphqlError(trainerProfileResult[0].reason));
  const showUpdatedBanner = params?.crypto === "updated";
  const readiness = getTrainerCryptoReadiness(profile);
  const services = profile?.services ?? [];

  return (
    <div className="space-y-6">
      <Link
        href="/trainer"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <TrainerNavigationHeader activeTab="crypto" />

      <PageHeader
        title="Crypto Setup"
        description="Configure the Solana wallet and token defaults needed to activate crypto bookings."
      />

      {showSessionWarning && (
        <SessionWarning description="Your crypto setup could not be refreshed with the current Google session. You can review the page, but save changes only after signing in again." />
      )}

      {showUpdatedBanner && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-300/40 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="mt-0.5 size-4.5 shrink-0 text-emerald-600" />
          <p>
            <strong>Crypto settings saved:</strong> your trainer wallet system has been updated.
            Review your services below to make sure any crypto-priced service uses the correct token mint.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <CryptoSetupForm
            walletAddress={profile?.user.walletAddress}
            payoutMintAddress={profile?.payoutMintAddress}
          />

          <section className="glass-card-elevated overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Service readiness</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Services need both a crypto price and a token mint to be bookable with crypto.
              </p>
            </div>

            <div className="space-y-3 p-5">
              {services.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
                  No services found yet. Create a service first, then come back here to activate crypto booking.
                </div>
              ) : (
                services.map((service) => {
                  const hasCryptoPrice =
                    typeof service.priceInLamports === "number" && service.priceInLamports > 0;
                  const isCryptoReady = hasCryptoPrice && Boolean(service.tokenMintAddress);

                  return (
                    <div
                      key={service.id}
                      className="rounded-2xl border border-border bg-background/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-primary-deep">{service.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {hasCryptoPrice
                              ? `${formatUSDC(lamportsToTokenUnits(service.priceInLamports))} configured for crypto pricing`
                              : "Crypto pricing is not enabled for this service"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isCryptoReady
                              ? "bg-emerald-500/10 text-emerald-700"
                              : hasCryptoPrice
                                ? "bg-amber-500/10 text-amber-700"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isCryptoReady ? "READY" : hasCryptoPrice ? "MINT MISSING" : "FIAT ONLY"}
                        </span>
                      </div>

                      {service.tokenMintAddress && (
                        <p className="mt-3 rounded-xl bg-muted/60 px-3 py-2 font-mono text-[11px] text-muted-foreground">
                          {service.tokenMintAddress}
                        </p>
                      )}
                    </div>
                  );
                })
              )}

              <Link
                href="/trainer/services"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold text-muted-foreground hover:border-primary/40 hover:text-primary-deep"
              >
                Manage Services
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="glass-card-elevated overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Activation checklist</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Complete all items below to make crypto checkout reliable for clients.
              </p>
            </div>

            <div className="space-y-3 p-5">
              {readiness.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-background/70 p-4"
                >
                  {item.complete ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                  ) : (
                    <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-600" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-primary-deep">{item.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {item.complete ? "Complete" : "Still needs attention"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card-elevated overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold">Getting started help</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Quick references for trainers new to Solana and token-based booking.
              </p>
            </div>

            <div className="space-y-4 p-5 text-sm">
              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="font-semibold text-primary-deep">What is a wallet address?</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Your wallet address is your public Solana account. ReLive uses it to identify the
                  trainer payout destination during crypto booking and release flows.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-background/70 p-4">
                <p className="font-semibold text-primary-deep">What is a token mint address?</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  A token mint identifies the token itself on Solana. Services with crypto pricing
                  need a mint so the app knows which token the client should pay with.
                </p>
              </div>

              <div className="rounded-2xl border border-[rgba(74,93,62,0.15)] bg-[rgba(74,93,62,0.03)] p-4 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 size-4 shrink-0 text-[#4a5d3e]" />
                  <p>
                    ReLive currently uses Solana devnet in this local environment. Make sure your
                    wallet, test funds, and token mint all belong to the same network.
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <a
                  href="https://phantom.app/download"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm font-semibold text-primary-deep hover:border-primary/40"
                >
                  <span className="inline-flex items-center gap-2">
                    <Wallet className="size-4" />
                    Install Phantom
                  </span>
                  <ExternalLink className="size-3.5" />
                </a>
                <a
                  href="https://solflare.com/download"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm font-semibold text-primary-deep hover:border-primary/40"
                >
                  <span className="inline-flex items-center gap-2">
                    <Wallet className="size-4" />
                    Install Solflare
                  </span>
                  <ExternalLink className="size-3.5" />
                </a>
                <a
                  href="https://faucet.solana.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-between rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm font-semibold text-primary-deep hover:border-primary/40"
                >
                  <span className="inline-flex items-center gap-2">
                    <Coins className="size-4" />
                    Open Solana Faucet
                  </span>
                  <ExternalLink className="size-3.5" />
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
