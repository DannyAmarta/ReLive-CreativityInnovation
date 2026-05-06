import { useEffect, useState } from "react";
import { Loader2, Wallet, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import type { Service, Trainer } from "@/lib/mock-data";
import { formatIDR } from "@/lib/format";
import { computeFee } from "@/lib/mock-data";
import { actions } from "@/lib/store";
import { toast } from "sonner";

type Stage = "confirm" | "polling" | "timeout";

export function FiatBookingModal({
  service,
  trainer,
  onClose,
}: {
  service: Service;
  trainer: Trainer;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [stage, setStage] = useState<Stage>("confirm");
  const fee = computeFee(service.priceIdr);
  const total = service.priceIdr + fee;
  const bookingId = `b_${Date.now()}`;

  useEffect(() => {
    if (stage !== "polling") return;
    const successAt = 4000;
    const t1 = setTimeout(() => {
      actions.setBookingStatus(bookingId, "ACTIVE");
      toast.success("Payment confirmed", { description: "Your booking is now active." });
      onClose();
      navigate({ to: "/dashboard" });
    }, successAt);
    return () => clearTimeout(t1);
  }, [stage, bookingId, navigate, onClose]);

  const handlePay = () => {
    actions.addBooking({
      id: bookingId,
      trainerId: trainer.id,
      trainerName: trainer.name,
      trainerPhoto: trainer.photo,
      serviceTitle: service.title,
      scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
      paymentType: "FIAT",
      amountIdr: total,
      status: "PENDING",
      paymentUrl: "#mock-duitku",
    });
    setStage("polling");
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-end bg-foreground/30 p-0 backdrop-blur-sm md:place-items-center md:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-[var(--shadow-lift)] md:rounded-3xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-primary-deep">
              {stage === "confirm" ? "Confirm Booking" : "Waiting for payment"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {service.title} · {trainer.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {stage === "confirm" && (
          <>
            <div className="rounded-2xl bg-muted p-4">
              <Row label="Service price" value={formatIDR(service.priceIdr)} />
              <Row label="Processing fee (2.5% + IDR 4,000)" value={formatIDR(fee)} />
              <div className="my-3 h-px bg-border" />
              <Row
                label="Total"
                value={formatIDR(total)}
                bold
              />
            </div>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              <PaymentChip label="GoPay" />
              <PaymentChip label="QRIS" />
              <PaymentChip label="Bank Transfer" />
            </div>
            <button
              onClick={handlePay}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Wallet className="h-4 w-4" />
              Pay {formatIDR(total)}
            </button>
          </>
        )}

        {stage === "polling" && (
          <div className="py-6 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm font-medium text-primary-deep">
              Waiting for payment confirmation…
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Complete payment in the Duitku window. We will redirect you when it's confirmed.
            </p>
            <button
              onClick={() => setStage("timeout")}
              className="mt-6 text-xs text-muted-foreground underline"
            >
              Payment not showing? Click to retry
            </button>
          </div>
        )}

        {stage === "timeout" && (
          <div className="py-6 text-center">
            <p className="text-sm font-medium text-destructive">
              We couldn't confirm your payment.
            </p>
            <button
              onClick={() => setStage("polling")}
              className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
            >
              Retry payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? "font-display text-base font-bold text-primary" : "text-foreground"}>
        {value}
      </span>
    </div>
  );
}

function PaymentChip({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-background px-3 py-1 font-medium text-foreground">
      {label}
    </span>
  );
}