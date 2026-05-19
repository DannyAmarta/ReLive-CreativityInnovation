"use client";

import { useState, useTransition } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { createBookingAction } from "@/lib/actions/marketplace";

// ─── Duitku Payment Method Catalog ──────────────────────────────────────────
// Codes from: https://docs.duitku.com/api/en/#payment-method
type PaymentMethod = {
  code: string;
  label: string;
  category: string;
  emoji: string;
  sandboxSupported: boolean;
};

const PAYMENT_METHODS: PaymentMethod[] = [
  // QRIS
  { code: "LQ", label: "QRIS", category: "QRIS", emoji: "⬛", sandboxSupported: true },
  { code: "NQ", label: "QRIS by Nobu", category: "QRIS", emoji: "⬛", sandboxSupported: false },
  // Virtual Accounts
  { code: "VA", label: "Maybank Virtual Account", category: "Virtual Account", emoji: "🏦", sandboxSupported: true },
  { code: "VC", label: "BCA Virtual Account", category: "Virtual Account", emoji: "🔵", sandboxSupported: true },
  { code: "M2", label: "Mandiri Virtual Account", category: "Virtual Account", emoji: "🟡", sandboxSupported: true },
  { code: "BT", label: "Permata Virtual Account", category: "Virtual Account", emoji: "🟢", sandboxSupported: true },
  { code: "B1", label: "CIMB Niaga Virtual Account", category: "Virtual Account", emoji: "🔴", sandboxSupported: true },
  { code: "BV", label: "BNI Virtual Account", category: "Virtual Account", emoji: "🟠", sandboxSupported: true },
  { code: "BR", label: "BRI Virtual Account", category: "Virtual Account", emoji: "🔵", sandboxSupported: false },
  { code: "AG", label: "Artha Graha Virtual Account", category: "Virtual Account", emoji: "🏦", sandboxSupported: false },
  { code: "S1", label: "Sahabat Sampoerna Virtual Account", category: "Virtual Account", emoji: "🟣", sandboxSupported: false },
  { code: "NC", label: "Bank Neo Commerce Virtual Account", category: "Virtual Account", emoji: "⚫", sandboxSupported: false },
  { code: "DM", label: "Danamon Virtual Account", category: "Virtual Account", emoji: "🔴", sandboxSupported: false },
  { code: "IR", label: "BSI Virtual Account", category: "Virtual Account", emoji: "🟢", sandboxSupported: false },
  { code: "A1", label: "ATM Bersama", category: "Virtual Account", emoji: "🏧", sandboxSupported: false },
  // E-Wallets
  { code: "OV", label: "OVO", category: "E-Wallet", emoji: "💜", sandboxSupported: false },
  { code: "SA", label: "ShopeePay", category: "E-Wallet", emoji: "🧡", sandboxSupported: false },
  { code: "DA", label: "Dana", category: "E-Wallet", emoji: "🔵", sandboxSupported: false },
  { code: "LA", label: "LinkAja", category: "E-Wallet", emoji: "🔴", sandboxSupported: false },
];

const CATEGORIES = ["QRIS", "Virtual Account", "E-Wallet"];

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  service: {
    id: number;
    title: string;
    priceInIdr: number;
  };
  trainerId: number;
  slot: { start: string; end: string };
  onClose: () => void;
};

// ─── Format IDR ───────────────────────────────────────────────────────────────
function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

// ─── Component ───────────────────────────────────────────────────────────────
export function CheckoutModal({ service, trainerId, slot, onClose }: Props) {
  const [selectedCode, setSelectedCode] = useState<string>("LQ");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const estimatedFee = Math.round(service.priceInIdr * 0.007 + 1500);
  const total = service.priceInIdr + estimatedFee;

  function handleSubmit() {
    setError(null);
    const formData = new FormData();
    formData.set("trainerId", String(trainerId));
    formData.set("serviceId", String(service.id));
    formData.set("paymentMethod", "FIAT");
    formData.set("paymentMethodCode", selectedCode);
    formData.set("scheduledStart", slot.start);
    formData.set("scheduledEnd", slot.end);
    formData.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);

    startTransition(async () => {
      try {
        await createBookingAction(formData);
      } catch (err) {
        // NEXT_REDIRECT is a special error thrown by redirect(), not a real error
        if (err instanceof Error && err.message === "NEXT_REDIRECT") return;
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <h2 className="font-display text-xl font-bold text-primary-deep">Checkout</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">{service.title}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Order Summary */}
        <div className="border-b border-border px-6 py-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Service price</span>
            <span className="font-medium">{formatIDR(service.priceInIdr)}</span>
          </div>
          <div className="mt-1.5 flex justify-between text-sm">
            <span className="text-muted-foreground">Platform fee (est.)</span>
            <span className="font-medium">{formatIDR(estimatedFee)}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-3">
            <span className="font-semibold">Total</span>
            <span className="font-display text-lg font-bold text-primary">{formatIDR(total)}</span>
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="max-h-72 overflow-y-auto px-6 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Choose Payment Method
          </p>
          {CATEGORIES.map((category) => {
            const methods = PAYMENT_METHODS.filter((m) => m.category === category);
            return (
              <div key={category} className="mb-4">
                <p className="mb-2 text-xs text-muted-foreground">{category}</p>
                <div className="grid grid-cols-2 gap-2">
                  {methods.map((method) => (
                    <button
                      key={method.code}
                      type="button"
                      disabled={isPending}
                      onClick={() => setSelectedCode(method.code)}
                      className={`flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left text-sm transition-all disabled:opacity-40 ${
                        selectedCode === method.code
                          ? "border-primary bg-primary/10 font-semibold text-primary"
                          : "border-border bg-background text-foreground hover:border-primary/40"
                      }`}
                    >
                      <span className="text-xl leading-none">{method.emoji}</span>
                      <div>
                        <span className="block text-sm font-medium leading-tight">{method.label}</span>
                        {!method.sandboxSupported && (
                          <span className="block text-[10px] text-muted-foreground">Prod only</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !selectedCode}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Redirecting to payment…
              </>
            ) : (
              <>Pay {formatIDR(total)} with {PAYMENT_METHODS.find((m) => m.code === selectedCode)?.label}</>
            )}
          </button>
          <p className="mt-2.5 text-center text-xs text-muted-foreground">
            You will be redirected to a secure Duitku payment page.
          </p>
        </div>
      </div>
    </div>
  );
}
