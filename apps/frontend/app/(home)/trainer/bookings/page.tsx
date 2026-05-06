"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/trainer/PageHeader";
import { Avatar } from "@/components/trainer/Avatar";
import { StatusBadge } from "@/components/trainer/StatusBadge";
import { EmptyState } from "@/components/trainer/EmptyState";
import {
  bookings as initialBookings,
  fmtDateTime,
  fmtIdr,
  fmtUsdc,
  type Booking,
  type BookingStatus,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, CheckCircle2, Search, Send, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ label: string; value: BookingStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Active", value: "ACTIVE" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Disputed", value: "DISPUTED" },
];

export default function Bookings() {
  const [data, setData] = useState<Booking[]>(initialBookings);
  const [filter, setFilter] = useState<BookingStatus | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<Booking | null>(null);

  const filtered = useMemo(() => {
    return data.filter((b) => {
      if (filter !== "ALL" && b.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return b.client.name.toLowerCase().includes(q) || b.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [data, filter, query]);

  const releaseFunds = (b: Booking) => {
    setData((xs) => xs.map((x) => (x.id === b.id ? { ...x, status: "COMPLETED" } : x)));
    toast.success(`Funds released for ${b.client.name}`, { description: `${fmtUsdc(b.amountUsdc!)} sent to your Solana wallet.` });
  };

  const cancel = (b: Booking) => {
    setData((xs) => xs.map((x) => (x.id === b.id ? { ...x, status: "CANCELLED" } : x)));
    toast.success(`Booking ${b.id} cancelled`);
    setConfirm(null);
  };

  return (
    <div>
      <PageHeader title="Bookings" description="Manage incoming sessions across crypto and fiat payments." />

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by client name or booking ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 h-10 bg-card"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {FILTERS.map((f) => {
          const count = f.value === "ALL" ? data.length : data.filter((b) => b.status === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all",
                filter === f.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-accent/40 hover:text-foreground"
              )}
            >
              {f.label}
              <span className={cn("ml-1.5 tabular-nums", filter === f.value ? "opacity-70" : "text-muted-foreground/60")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card-elevated">
          <EmptyState icon={Calendar} title="No bookings here" description="Try adjusting your filters or search." />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block glass-card-elevated overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="px-5 py-3 font-medium">Client</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">When</th>
                  <th className="px-5 py-3 font-medium">Payment</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar initials={b.client.avatar} className="size-8" />
                        <div>
                          <p className="font-medium">{b.client.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{b.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{b.serviceTitle}</td>
                    <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">{fmtDateTime(b.scheduledAt)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={b.paymentMethod} />
                    </td>
                    <td className="px-5 py-3.5 font-mono tabular-nums">
                      {b.paymentMethod === "CRYPTO" ? fmtUsdc(b.amountUsdc!) : fmtIdr(b.amountIdr!)}
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <BookingActions booking={b} onRelease={releaseFunds} onCancel={(b) => setConfirm(b)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((b) => (
              <div key={b.id} className="glass-card-elevated p-4">
                <div className="flex items-start gap-3 mb-3">
                  <Avatar initials={b.client.avatar} className="size-9" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{b.client.name}</p>
                    <p className="text-xs text-muted-foreground">{b.serviceTitle}</p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-muted-foreground">{fmtDateTime(b.scheduledAt)}</span>
                  <span className="font-mono tabular-nums font-medium">
                    {b.paymentMethod === "CRYPTO" ? fmtUsdc(b.amountUsdc!) : fmtIdr(b.amountIdr!)}
                  </span>
                </div>
                <BookingActions booking={b} onRelease={releaseFunds} onCancel={(b) => setConfirm(b)} />
              </div>
            ))}
          </div>
        </>
      )}

      <Dialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this booking?</DialogTitle>
            <DialogDescription>
              {confirm && `This will cancel ${confirm.client.name}'s ${confirm.serviceTitle} session. This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirm(null)}>Keep booking</Button>
            <Button variant="destructive" onClick={() => confirm && cancel(confirm)}>Yes, cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookingActions({
  booking,
  onRelease,
  onCancel,
}: {
  booking: Booking;
  onRelease: (b: Booking) => void;
  onCancel: (b: Booking) => void;
}) {
  if (booking.status === "ACTIVE" && booking.paymentMethod === "CRYPTO") {
    return (
      <Button
        size="sm"
        className="bg-gradient-primary text-primary-foreground hover:opacity-90 h-8"
        onClick={() => onRelease(booking)}
      >
        <Send className="size-3 mr-1.5" /> Release funds
      </Button>
    );
  }
  if (booking.status === "ACTIVE" && booking.paymentMethod === "FIAT") {
    return <p className="text-[11px] text-muted-foreground italic">Auto-credited on completion</p>;
  }
  if (booking.status === "PENDING") {
    return (
      <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive" onClick={() => onCancel(booking)}>
        <X className="size-3 mr-1.5" /> Cancel
      </Button>
    );
  }
  if (booking.status === "DISPUTED") {
    return <Button size="sm" variant="outline" className="h-8">View dispute</Button>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
      <CheckCircle2 className="size-3" /> Closed
    </span>
  );
}

