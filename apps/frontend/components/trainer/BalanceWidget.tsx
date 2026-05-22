import Link from "next/link";
import { Wallet, ArrowRight, TrendingUp } from "lucide-react";
import { formatIDR } from "@/lib/format";
import type { FiatWalletRecord, BookingRecord } from "@/lib/marketplace";

interface BalanceWidgetProps {
  wallet: FiatWalletRecord;
  bookings: BookingRecord[];
}

export function BalanceWidget({ wallet, bookings }: BalanceWidgetProps) {
  const completedCount = bookings.filter((b) => b.status === "COMPLETED").length;
  const pendingEarnings = bookings
    .filter((b) => b.status === "ACTIVE" && b.paymentType === "FIAT")
    .reduce((sum, b) => sum + (b.fiatAmount ?? b.servicePriceIdr ?? 0), 0);

  return (
    <div className="bg-gradient-primary rounded-[1.75rem] shadow-lift p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-[rgba(255,255,255,0.15)] flex items-center justify-center">
            <Wallet className="size-4 text-[#f8f6ef]" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(255,255,255,0.65)]">
            Available Balance
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-[rgba(255,255,255,0.12)] px-2.5 py-1">
          <TrendingUp className="size-3 text-[#d7b870]" />
          <span className="text-[11px] font-bold text-[#d7b870]">IDR</span>
        </div>
      </div>

      {/* Amount */}
      <div>
        <p className="font-mono text-4xl font-bold tabular-nums text-[#f8f6ef] leading-none">
          {formatIDR(wallet.balanceIdr)}
        </p>
        <p className="text-xs text-[rgba(255,255,255,0.5)] mt-1.5">Fiat wallet balance</p>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[rgba(255,255,255,0.1)] px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.5)]">
            Completed
          </p>
          <p className="text-xl font-bold font-mono text-[#f8f6ef] mt-0.5">{completedCount}</p>
          <p className="text-[10px] text-[rgba(255,255,255,0.45)]">sessions</p>
        </div>
        <div className="rounded-2xl bg-[rgba(255,255,255,0.1)] px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-[rgba(255,255,255,0.5)]">
            Pending
          </p>
          <p className="text-sm font-bold font-mono text-[#f8f6ef] mt-0.5 leading-tight">
            {formatIDR(pendingEarnings)}
          </p>
          <p className="text-[10px] text-[rgba(255,255,255,0.45)]">in-progress</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/trainer/wallet"
        className="flex items-center justify-center gap-2 rounded-full bg-[rgba(255,255,255,0.92)] px-5 py-2.5 text-sm font-semibold text-[#31442a] transition-all hover:bg-white hover:-translate-y-0.5 hover:shadow-card"
      >
        Withdraw Funds
        <ArrowRight className="size-3.5" />
      </Link>
    </div>
  );
}
