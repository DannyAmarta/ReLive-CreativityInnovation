import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Info, Plus, RefreshCw, Wallet, X } from "lucide-react";
import { Header } from "@/components/relive/Header";
import { StatusBadge } from "@/components/relive/StatusBadge";
import { WithdrawalModal } from "@/components/relive/WithdrawalModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/store";
import { formatDate, formatIDR } from "@/lib/format";
import type { Booking, Withdrawal } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/trainer/fiat-wallet")({
  head: () => ({
    meta: [
      { title: "Fiat Wallet — ReLive" },
      { name: "description", content: "Manage IDR earnings from client bookings and withdraw to bank or e-wallet." },
    ],
  }),
  component: FiatWalletPage,
});

type LedgerEntry =
  | { kind: "CREDIT"; id: string; date: string; amount: number; description: string; reference: string; status: "COMPLETED"; booking: Booking }
  | { kind: "DEBIT"; id: string; date: string; amount: number; description: string; reference: string; status: Withdrawal["status"]; withdrawal: Withdrawal };

const SANDBOX = (import.meta as any).env?.VITE_DUITKU_SANDBOX_MODE === "true";

function FiatWalletPage() {
  const balance = useStore((s) => s.fiatBalance);
  const withdrawals = useStore((s) => s.withdrawals);
  const bookings = useStore((s) => s.bookings);

  const [open, setOpen] = useState(false);
  const [retrying, setRetrying] = useState<Withdrawal | null>(null);
  const [filterPending, setFilterPending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [refreshTick]);

  const pendingTotal = withdrawals
    .filter((w) => w.status === "PENDING")
    .reduce((s, w) => s + w.amountIdr, 0);
  const lifetimeWithdrawn = withdrawals
    .filter((w) => w.status === "COMPLETED")
    .reduce((s, w) => s + w.amountIdr, 0);

  const hasPending = pendingTotal > 0;

  const ledger: LedgerEntry[] = useMemo(() => {
    const credits: LedgerEntry[] = bookings
      .filter((b) => b.paymentType === "FIAT" && b.status === "COMPLETED" && b.amountIdr)
      .map((b) => ({
        kind: "CREDIT",
        id: `credit_${b.id}`,
        date: b.scheduledAt,
        amount: Math.round((b.amountIdr ?? 0) * 0.9),
        description: `Session with ${b.trainerName}`,
        reference: b.id.toUpperCase(),
        status: "COMPLETED",
        booking: b,
      }));
    const debits: LedgerEntry[] = withdrawals.map((w) => ({
      kind: "DEBIT",
      id: w.id,
      date: w.createdAt,
      amount: w.amountIdr,
      description:
        w.method === "BANK_TRANSFER"
          ? `Withdrawal to ${w.bankCode ?? "Bank"}`
          : "Withdrawal to E-Wallet",
      reference: w.reference,
      status: w.status,
      withdrawal: w,
    }));
    return [...credits, ...debits].sort((a, b) => +new Date(b.date) - +new Date(a.date));
  }, [bookings, withdrawals]);

  const visibleLedger = filterPending
    ? ledger.filter((e) => e.kind === "DEBIT" && e.status === "PENDING")
    : ledger;

  const onRetry = (w: Withdrawal) => {
    setRetrying(w);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setRetrying(null);
  };

  const refresh = () => {
    setRefreshTick((n) => n + 1);
    toast.success("Refreshed");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-primary-deep md:text-4xl">
              Fiat Wallet
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage your IDR earnings from client bookings.
            </p>
          </div>
          {SANDBOX && (
            <span className="inline-flex h-fit items-center gap-1.5 rounded-full bg-accent-glow/60 px-3 py-1 text-xs font-semibold text-primary-deep">
              <span className="h-1.5 w-1.5 rounded-full bg-primary-deep" />
              Sandbox mode — withdrawals are simulated
            </span>
          )}
        </div>

        {/* Balance card */}
        <div
          className="rounded-3xl p-6 text-primary-foreground shadow-[var(--shadow-lift)] md:p-8"
          style={{ background: "var(--gradient-balance)" }}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                <Wallet className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide opacity-80">Available</p>
                <p className="font-display text-3xl font-bold md:text-4xl">{formatIDR(balance)}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(true)}
              disabled={balance < 50_000 || hasPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-card px-6 py-3 text-sm font-semibold text-primary-deep transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Withdraw Funds
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/20 pt-5 sm:grid-cols-2">
            <button
              onClick={() => setFilterPending(true)}
              disabled={pendingTotal === 0}
              className="text-left transition-opacity hover:opacity-90 disabled:cursor-default disabled:opacity-100"
            >
              <p className="text-xs uppercase tracking-wide opacity-80">Pending withdrawals</p>
              <p
                className={cn(
                  "font-display text-xl font-bold",
                  pendingTotal > 0 && "underline underline-offset-4 decoration-white/60",
                )}
              >
                {formatIDR(pendingTotal)}
              </p>
            </button>
            <div>
              <p className="text-xs uppercase tracking-wide opacity-80">Total withdrawn (lifetime)</p>
              <p className="font-display text-xl font-bold">{formatIDR(lifetimeWithdrawn)}</p>
            </div>
          </div>
        </div>

        {/* History */}
        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-primary-deep">Transaction History</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={refresh}
                    aria-label="Refresh"
                    className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
                  >
                    <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>Refresh</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {filterPending && (
            <div className="mt-3">
              <button
                onClick={() => setFilterPending(false)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              >
                Filter: Pending
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="mt-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          ) : visibleLedger.length === 0 ? (
            <EmptyState filterPending={filterPending} />
          ) : (
            <>
              {/* Desktop */}
              <div className="mt-4 hidden overflow-hidden rounded-2xl border border-border bg-card md:block">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 text-left font-semibold">Date</th>
                      <th className="px-5 py-3 text-left font-semibold">Description</th>
                      <th className="px-5 py-3 text-left font-semibold">Amount</th>
                      <th className="px-5 py-3 text-left font-semibold">Status</th>
                      <th className="px-5 py-3 text-left font-semibold">Reference</th>
                      <th className="px-5 py-3 text-right font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleLedger.map((e) => (
                      <LedgerRow key={e.id} entry={e} onRetry={onRetry} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="mt-4 space-y-3 md:hidden">
                {visibleLedger.map((e) => (
                  <LedgerCard key={e.id} entry={e} onRetry={onRetry} />
                ))}
              </div>
            </>
          )}
        </section>
      </main>

      {open && (
        <WithdrawalModal
          balance={balance}
          hasPending={hasPending && !retrying}
          onClose={handleClose}
          prefill={
            retrying
              ? {
                  method: retrying.method,
                  amount: retrying.amountIdr,
                  bankCode: retrying.bankCode,
                  accountNumber: retrying.accountNumber,
                  accountName: retrying.accountName,
                  ewalletPhone: retrying.ewalletPhone,
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function EmptyState({ filterPending }: { filterPending: boolean }) {
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-accent-mint/15 text-accent-mint">
        <span className="relative">
          <Wallet className="h-6 w-6" />
          <Plus className="absolute -right-2 -top-2 h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-4 font-display font-bold text-primary-deep">
        {filterPending ? "No pending withdrawals" : "No transactions yet"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        {filterPending
          ? "Once you request a withdrawal, it'll show up here while it's being processed."
          : "Complete a fiat session to see IDR credits here."}
      </p>
    </div>
  );
}

function FailedBadge({ reason }: { reason?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <StatusBadge status="FAILED" />
      {reason && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button aria-label="Failure reason" className="text-destructive">
                <Info className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Failure reason: {reason}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </span>
  );
}

function EntryStatus({ entry }: { entry: LedgerEntry }) {
  if (entry.kind === "DEBIT" && entry.status === "FAILED") {
    return <FailedBadge reason={entry.withdrawal.failureReason} />;
  }
  return <StatusBadge status={entry.status} />;
}

function EntryDetails({ entry }: { entry: LedgerEntry }) {
  if (entry.kind === "CREDIT") {
    const b = entry.booking;
    return (
      <div className="space-y-2 text-sm">
        <p className="font-display font-bold text-primary-deep">Credit from session</p>
        <Detail label="Client" value={b.trainerName} />
        <Detail label="Service" value={b.serviceTitle} />
        <Detail label="Date" value={formatDate(b.scheduledAt)} />
        <Detail label="Booking ID" value={b.id.toUpperCase()} mono />
        <div className="pt-1"><StatusBadge status="COMPLETED" /></div>
      </div>
    );
  }
  const w = entry.withdrawal;
  const dest =
    w.method === "BANK_TRANSFER"
      ? `${w.bankCode} •••• ${(w.accountNumber ?? "").slice(-4)}`
      : `E-Wallet ${w.ewalletPhone ?? ""}`;
  return (
    <div className="space-y-2 text-sm">
      <p className="font-display font-bold text-primary-deep">
        Withdrawal to {w.method === "BANK_TRANSFER" ? w.bankCode : "E-Wallet"}
      </p>
      <Detail label="Amount" value={formatIDR(w.amountIdr)} />
      <Detail label="Requested" value={formatDate(w.createdAt)} />
      <Detail label="Destination" value={dest} />
      <Detail label="Reference" value={w.reference} mono />
      <div className="pt-1"><EntryStatus entry={entry} /></div>
      {w.failureReason && (
        <p className="text-xs text-destructive">Reason: {w.failureReason}</p>
      )}
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-foreground", mono && "font-mono text-xs")}>{value}</span>
    </div>
  );
}

function LedgerRow({ entry, onRetry }: { entry: LedgerEntry; onRetry: (w: Withdrawal) => void }) {
  const isCredit = entry.kind === "CREDIT";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <tr className="cursor-pointer border-t border-border hover:bg-muted/50">
          <td className="px-5 py-4">{formatDate(entry.date)}</td>
          <td className="px-5 py-4">{entry.description}</td>
          <td
            className={cn(
              "px-5 py-4 font-display font-bold",
              isCredit ? "text-primary" : "text-foreground",
            )}
          >
            {isCredit ? "+" : "−"} {formatIDR(entry.amount)}
          </td>
          <td className="px-5 py-4"><EntryStatus entry={entry} /></td>
          <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{entry.reference}</td>
          <td className="px-5 py-4 text-right">
            {entry.kind === "DEBIT" && entry.status === "FAILED" ? (
              <button
                onClick={(ev) => {
                  ev.stopPropagation();
                  onRetry(entry.withdrawal);
                }}
                className="rounded-full border border-primary/40 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/5"
              >
                Retry
              </button>
            ) : <span className="text-muted-foreground">—</span>}
          </td>
        </tr>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <EntryDetails entry={entry} />
      </PopoverContent>
    </Popover>
  );
}

function LedgerCard({ entry, onRetry }: { entry: LedgerEntry; onRetry: (w: Withdrawal) => void }) {
  const isCredit = entry.kind === "CREDIT";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="block w-full rounded-2xl border border-border bg-card p-4 text-left">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">{entry.description}</p>
              <p className="text-xs text-muted-foreground">{formatDate(entry.date)}</p>
            </div>
            <p
              className={cn(
                "font-display text-base font-bold",
                isCredit ? "text-primary" : "text-foreground",
              )}
            >
              {isCredit ? "+" : "−"} {formatIDR(entry.amount)}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <EntryStatus entry={entry} />
            <span className="font-mono text-[10px] text-muted-foreground">{entry.reference}</span>
          </div>
          {entry.kind === "DEBIT" && entry.status === "FAILED" && (
            <button
              onClick={(ev) => {
                ev.stopPropagation();
                onRetry(entry.withdrawal);
              }}
              className="mt-3 w-full rounded-full border border-primary/40 px-3 py-2 text-xs font-semibold text-primary"
            >
              Retry
            </button>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-[calc(100vw-2rem)] max-w-sm">
        <EntryDetails entry={entry} />
      </PopoverContent>
    </Popover>
  );
}
