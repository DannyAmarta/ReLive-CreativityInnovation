"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { CheckoutModal } from "@/components/relive/CheckoutModal";
import { CryptoBookingModal } from "@/components/relive/CryptoBookingModal";
import { createBookingAction } from "@/lib/actions/marketplace";

type Service = {
  id: number;
  title: string;
  priceInIdr: number;
  priceInLamports: number | null;
};

type Props = {
  service: Service;
  trainerId: number;
  trainerName?: string;
  slot: { start: string; end: string };
};

// ─── Crypto booking now uses a modal for on-chain checkout ──────────────
export function CryptoBookingButton({ service, trainerId, trainerName, slot }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary-deep"
      >
        Reserve with Crypto
      </button>

      {open && (
        <CryptoBookingModal
          service={service as any}
          trainerId={trainerId}
          trainerName={trainerName || "Trainer"}
          slot={slot}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

// ─── Fiat booking opens the Checkout Modal ─────────────────────────────────
export function FiatBookingButton({ service, trainerId, slot }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
      >
        <Wallet className="h-4 w-4" />
        Book with IDR
      </button>

      {open && (
        <CheckoutModal
          service={{ id: service.id, title: service.title, priceInIdr: service.priceInIdr }}
          trainerId={trainerId}
          slot={slot}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
