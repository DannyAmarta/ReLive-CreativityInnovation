"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/relive/StatusBadge";
import { formatDateTime, formatIDR } from "@/lib/format";
import { ArrowUpRight, Receipt } from "lucide-react";
import type { BookingRecord } from "@/lib/marketplace";

const TABS = [
  { label: "All", value: "ALL" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Active", value: "ACTIVE" },
  { label: "Pending", value: "PENDING" },
  { label: "Cancelled", value: "CANCELLED" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export function ClientWalletLedger({ bookings }: { bookings: BookingRecord[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("ALL");

  const filtered =
    activeTab === "ALL" ? bookings : bookings.filter((b) => b.status === activeTab);

  return (
    <div className="glass-card-elevated overflow-hidden">
      {/* Header + filter tabs */}
      <div className="px-5 pt-5 pb-0 border-b border-border">
        <h2 className="text-sm font-semibold mb-4">Spending History</h2>
        <div className="flex gap-1 overflow-x-auto pb-px">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "shrink-0 px-3 py-1.5 text-xs font-medium rounded-t-md border-b-2 transition-colors",
                activeTab === tab.value
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger list */}
      <ul className="divide-y divide-border">
        {filtered.length === 0 && (
          <li className="px-5 py-12 text-sm text-muted-foreground text-center">
            No transactions in this category yet.
          </li>
        )}
        {filtered.map((booking) => {
          const trainerName = booking.trainer?.user?.name ?? "Trainer";
          const serviceTitle = booking.service?.title ?? "Service";
          const amount = booking.fiatAmount ?? booking.servicePriceIdr ?? 0;
          const gateway = booking.gatewayPaymentMethod;

          return (
            <li key={booking.id} className="px-5 py-4 flex items-center gap-4">
              {/* Icon */}
              <div className="size-9 rounded-lg flex items-center justify-center shrink-0 border bg-destructive/8 border-destructive/20 text-destructive">
                <ArrowUpRight className="size-3.5" />
              </div>

              {/* Description */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  Payment for <span className="text-foreground">{serviceTitle}</span>
                  {" "}with{" "}
                  <span className="text-foreground">{trainerName}</span>
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-[11px] text-muted-foreground">
                    {formatDateTime(booking.createdAt)}
                  </p>
                  {gateway && (
                    <>
                      <span className="text-[11px] text-muted-foreground">·</span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground border border-border rounded px-1.5 py-0.5">
                        <Receipt className="size-2.5" />
                        {gateway.replace(/_/g, " ")}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Amount + badge */}
              <div className="text-right shrink-0">
                <StatusBadge status={booking.status} />
                <p className="mt-1.5 text-sm font-mono tabular-nums font-semibold text-destructive">
                  − {formatIDR(amount).replace("IDR ", "")}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
