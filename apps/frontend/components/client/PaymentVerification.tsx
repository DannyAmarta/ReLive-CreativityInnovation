"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle, XCircle, RefreshCw, MessageSquare } from "lucide-react";
import { verifyBookingPaymentAction } from "@/lib/actions/marketplace";

interface PaymentVerificationProps {
  bookingId: number;
}

export function PaymentVerification({ bookingId }: PaymentVerificationProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "active" | "pending_webhook" | "failed" | "not_found">("checking");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let active = true;
    let timerId: NodeJS.Timeout;

    async function checkStatus() {
      try {
        const res = await verifyBookingPaymentAction(bookingId);
        if (!active) return;

        if (res.status === "ACTIVE" && res.conversationId) {
          setStatus("active");
          // Hard navigate so the layout re-fetches notifications from DB,
          // picking up the "Booking Accepted" notification the backend just created.
          setTimeout(() => {
            window.location.href = `/client/messages?convId=${res.conversationId}`;
          }, 1500);
        } else if (res.status === "PENDING") {
          setStatus("pending_webhook");
          // Re-poll after 1.5s
          setAttempts((prev) => prev + 1);
          timerId = setTimeout(checkStatus, 1500);
        } else if (res.status === "NOT_FOUND") {
          setStatus("not_found");
        } else {
          setStatus("failed");
        }
      } catch (err) {
        console.error("Error verifying payment status:", err);
        // Retry anyway if we didn't exceed attempts
        setAttempts((prev) => prev + 1);
        timerId = setTimeout(checkStatus, 2000);
      }
    }

    checkStatus();

    return () => {
      active = false;
      clearTimeout(timerId);
    };
  }, [bookingId, router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-[#58784a]/20 bg-[#FDFBF7] p-8 shadow-2xl text-center">
        {status === "checking" && (
          <div className="space-y-6">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4a5d3e]/10">
              <Loader2 className="h-8 w-8 animate-spin text-[#4a5d3e]" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-primary-deep">
                Verifying Payment
              </h3>
              <p className="text-sm text-muted-foreground">
                Connecting to payment gateway to verify your transaction...
              </p>
            </div>
          </div>
        )}

        {status === "pending_webhook" && (
          <div className="space-y-6">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
              <RefreshCw className="h-8 w-8 animate-spin text-amber-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-amber-800">
                Processing Payment Confirmation
              </h3>
              <p className="text-sm text-muted-foreground px-4">
                We received your payment authorization! Activating your booking and setting up your chat session with the trainer (Attempt {attempts})...
              </p>
            </div>
          </div>
        )}

        {status === "active" && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-emerald-800">
                Payment Success & Active!
              </h3>
              <p className="text-sm text-muted-foreground">
                Your payment is verified and booking is now active.
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs text-[#4a5d3e] font-semibold bg-[#4a5d3e]/10 px-3 py-1 rounded-full animate-pulse">
                <MessageSquare className="size-3.5" /> Redirecting you to chat...
              </div>
            </div>
          </div>
        )}

        {status === "failed" && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100">
              <XCircle className="h-8 w-8 text-rose-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-rose-800">
                Verification Failed
              </h3>
              <p className="text-sm text-muted-foreground">
                We couldn't verify this payment transaction.
              </p>
            </div>
            <button
              onClick={() => router.push("/client/dashboard")}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {status === "not_found" && (
          <div className="space-y-6 animate-in zoom-in-95 duration-300">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100">
              <XCircle className="h-8 w-8 text-zinc-600" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold text-zinc-800">
                Booking Not Found
              </h3>
              <p className="text-sm text-muted-foreground">
                The specified booking ID could not be located.
              </p>
            </div>
            <button
              onClick={() => router.push("/client/dashboard")}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
