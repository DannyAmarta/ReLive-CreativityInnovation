import { SessionWarning } from "@/components/auth/SessionWarning";
import { ArrowDownToLine, Wallet as WalletIcon } from "lucide-react";
import { PageHeader } from "@/components/trainer/PageHeader";
import { StatusBadge } from "@/components/trainer/StatusBadge";
import { WithdrawalForm } from "@/components/trainer/WithdrawalForm";
import { isAuthenticationGraphqlError } from "@/lib/fetchGraphQL";
import { formatDateTime, formatIDR } from "@/lib/format";
import { getMyFiatWallet, getMyTrainerBookings, getMyWithdrawalRequests } from "@/lib/marketplace";

type LedgerEntry =
  | {
      kind: "CREDIT";
      id: string;
      createdAt: string;
      amountIdr: number;
      status: string;
      description: string;
    }
  | {
      kind: "WITHDRAWAL";
      id: string;
      createdAt: string;
      amountIdr: number;
      status: string;
      description: string;
      failureReason?: string | null;
    };

export default async function TrainerWalletPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [walletResult, withdrawalsResult, bookingsResult] = await Promise.allSettled([
    getMyFiatWallet(),
    getMyWithdrawalRequests(),
    getMyTrainerBookings(),
  ]);
  const params = searchParams ? await searchParams : {};
  const withdrawalRequested = params?.withdrawal === "requested";
  const wallet =
    walletResult.status === "fulfilled"
      ? walletResult.value
      : { balanceIdr: 0 };
  const withdrawals = withdrawalsResult.status === "fulfilled" ? withdrawalsResult.value : [];
  const bookings = bookingsResult.status === "fulfilled" ? bookingsResult.value : [];
  const showSessionWarning =
    params?.session === "expired" ||
    [walletResult, withdrawalsResult, bookingsResult].some(
      (result) => result.status === "rejected" && isAuthenticationGraphqlError(result.reason),
    );

  const credits: LedgerEntry[] = bookings
    .filter((booking) => booking.status === "COMPLETED" && booking.paymentType === "FIAT")
    .map((booking) => ({
      kind: "CREDIT",
      id: `booking-${booking.id}`,
      createdAt: booking.updatedAt,
      amountIdr: booking.servicePriceIdr ?? booking.fiatAmount ?? 0,
      status: "COMPLETED",
      description: `Credit from ${booking.service?.title ?? "service"} for ${booking.client?.name ?? "client"}`,
    }));

  const withdrawalEntries: LedgerEntry[] = withdrawals.map((withdrawal) => ({
    kind: "WITHDRAWAL",
    id: `withdrawal-${withdrawal.id}`,
    createdAt: withdrawal.requestedAt,
    amountIdr: withdrawal.amountIdr,
    status: withdrawal.status,
    description:
      withdrawal.paymentMethod === "EWALLET"
        ? `Withdrawal to e-wallet ${withdrawal.gatewayReference ?? ""}`.trim()
        : `Withdrawal to ${withdrawal.bankCode ?? "bank"} ${withdrawal.accountNumber ?? ""}`.trim(),
    failureReason: withdrawal.failureReason,
  }));

  const ledger = [...credits, ...withdrawalEntries].sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  return (
    <div>
      <PageHeader
        title="Wallet"
        description="Real fiat wallet balance plus seeded withdrawal history and booking credits."
      />

      {showSessionWarning && (
        <SessionWarning description="Wallet data could not be fully refreshed with the current Google session. You can still inspect the seeded layout, but request withdrawals only after signing in again." />
      )}

      {withdrawalRequested && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 p-4 text-sm text-primary-deep">
          Withdrawal request submitted. Refresh after the gateway finishes processing to see the newest status.
        </div>
      )}

      <section className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-border bg-gradient-primary text-primary-foreground p-6 shadow-elevated">
          <div className="flex items-center gap-2 mb-3">
            <WalletIcon className="size-4" />
            <p className="text-xs uppercase tracking-wider opacity-80">Available balance</p>
          </div>
          <p className="text-4xl sm:text-5xl font-semibold font-mono tabular-nums">{formatIDR(wallet.balanceIdr)}</p>
          <p className="mt-3 text-sm opacity-85">
            Backed by the trainer fiat wallet row returned from the backend.
          </p>
        </div>
        <div className="glass-card-elevated p-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Completed fiat credits</p>
          <p className="mt-2 text-3xl font-semibold font-mono tabular-nums">
            {formatIDR(credits.reduce((total, entry) => total + entry.amountIdr, 0))}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Derived from completed fiat bookings.</p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="glass-card-elevated p-5">
          <div className="mb-4 flex items-center gap-2">
            <ArrowDownToLine className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Request withdrawal</h2>
          </div>
          <WithdrawalForm />
        </div>

        <div className="glass-card-elevated overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold">Ledger</h2>
          </div>
          <ul className="divide-y divide-border">
            {ledger.length === 0 && (
              <li className="px-5 py-8 text-sm text-muted-foreground text-center">No wallet activity yet.</li>
            )}
            {ledger.map((entry) => (
              <li key={entry.id} className="px-5 py-4 flex items-center gap-4">
                <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 border ${entry.kind === "CREDIT" ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border text-muted-foreground"}`}>
                  <ArrowDownToLine className={`size-3.5 ${entry.kind === "CREDIT" ? "rotate-180" : ""}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{entry.description}</p>
                  <p className="text-[11px] text-muted-foreground">{formatDateTime(entry.createdAt)}</p>
                  {"failureReason" in entry && entry.failureReason && (
                    <p className="text-[11px] text-destructive">{entry.failureReason}</p>
                  )}
                </div>
                <div className="text-right">
                  <StatusBadge status={entry.status} dot={false} />
                  <p className={`mt-2 text-sm font-mono tabular-nums ${entry.kind === "CREDIT" ? "text-primary" : "text-foreground"}`}>
                    {entry.kind === "CREDIT" ? "+" : "-"}
                    {formatIDR(entry.amountIdr).replace("IDR ", "")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
