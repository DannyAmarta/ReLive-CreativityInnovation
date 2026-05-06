import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, Wallet, X, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Service, Trainer } from '@/lib/fiat-mock-data';
import { formatUSDC } from "@/lib/format";
import { actions, useStore } from "@/lib/store";
import { WalletConnectionModal } from "./WalletConnectionModal";
import { truncateAddress } from "./WalletButton";
import { toast } from "sonner";

type Stage = "summary" | "signing" | "confirming" | "success" | "error";

type Failure = "rejected" | "insufficient" | "timeout";

const FAILURE_COPY: Record<Failure, string> = {
  rejected: "Transaction was rejected in your wallet.",
  insufficient: "Insufficient USDC balance in your wallet.",
  timeout: "Transaction timed out. Please try again.",
};

const mockSignature = () =>
  Array.from({ length: 64 }, () =>
    "abcdef0123456789"[Math.floor(Math.random() * 16)],
  ).join("");

export function CryptoBookingModal({
  service,
  trainer,
  onClose,
}: {
  service: Service;
  trainer: Trainer;
  onClose: () => void;
}) {
  const navigate = useRouter();
  const wallet = useStore((s) => s.wallet);
  const [stage, setStage] = useState<Stage>("summary");
  const [failure, setFailure] = useState<Failure | null>(null);
  const [signature, setSignature] = useState<string>("");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const bookingId = `b_${Date.now()}`;

  const insufficient = wallet.connected && wallet.usdcBalance < service.priceUsdc;

  // Open wallet modal automatically if not connected
  useEffect(() => {
    if (!wallet.connected && stage === "summary") {
      setShowWalletModal(true);
    }
  }, [wallet.connected, stage]);

  // Mock the signing → confirming flow
  useEffect(() => {
    if (stage !== "signing") return;
    const t = setTimeout(() => {
      // Simulate user approving in wallet
      setSignature(mockSignature());
      setStage("confirming");
    }, 1500);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    if (stage !== "confirming") return;
    const t = setTimeout(() => {
      actions.addBooking({
        id: bookingId,
        trainerId: trainer.id,
        trainerName: trainer.name,
        trainerPhoto: trainer.photo,
        serviceTitle: service.title,
        scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
        paymentType: "CRYPTO",
        amountUsdc: service.priceUsdc,
        status: "ACTIVE",
      });
      setStage("success");
    }, 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    if (stage !== "success") return;
    const t = setTimeout(() => {
      toast.success("Booking confirmed on Solana");
      onClose();
      navigate.push("/client/dashboard");
    }, 1800);
    return () => clearTimeout(t);
  }, [stage, navigate, onClose]);

  const handleDeposit = () => {
    if (!wallet.connected) {
      setShowWalletModal(true);
      return;
    }
    if (insufficient) {
      setFailure("insufficient");
      setStage("error");
      return;
    }
    setStage("signing");
  };

  const handleRetry = () => {
    setFailure(null);
    setSignature("");
    setStage("summary");
  };

  return (
    <>
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
                {stage === "summary" && "Confirm Booking"}
                {stage === "signing" && "Approve in wallet"}
                {stage === "confirming" && "Confirming on Solana"}
                {stage === "success" && "Payment confirmed"}
                {stage === "error" && "Transaction failed"}
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

          {stage === "summary" && (
            <>
              <div className="space-y-1 rounded-2xl bg-muted p-4 text-sm">
                <Row label="Trainer" value={trainer.name} />
                <Row label="Service" value={service.title} />
                {service.durationMin && (
                  <Row label="Duration" value={`${service.durationMin} min`} />
                )}
              </div>

              <div className="mt-3 rounded-2xl bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total deposit</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    {formatUSDC(service.priceUsdc)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Plus a small Solana network fee (~$0.01).
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-border px-3 py-2.5 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Your wallet</p>
                  <p className="font-mono text-foreground">
                    {wallet.connected ? truncateAddress(wallet.address) : "Not connected"}
                  </p>
                </div>
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {wallet.connected ? "Change" : "Connect"}
                </button>
              </div>

              {insufficient && (
                <p className="mt-3 text-xs text-destructive">
                  Insufficient USDC. You need at least {formatUSDC(service.priceUsdc)}.
                </p>
              )}

              <button
                onClick={handleDeposit}
                disabled={!wallet.connected || insufficient}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Wallet className="h-4 w-4" />
                Deposit & Book
              </button>
              <button
                onClick={onClose}
                className="mt-2 w-full text-center text-xs text-muted-foreground hover:underline"
              >
                Cancel
              </button>
            </>
          )}

          {(stage === "signing" || stage === "confirming") && (
            <div className="py-6 text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium text-primary-deep">
                {stage === "signing"
                  ? "Approve the transaction in your wallet…"
                  : "Confirming on Solana…"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stage === "signing"
                  ? "Open your wallet popup to sign."
                  : "This may take up to 15 seconds."}
              </p>
              {signature && (
                <a
                  href={`https://solscan.io/tx/${signature}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  View on Solscan <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {stage === "success" && (
            <div className="py-6 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
              <p className="mt-4 text-sm font-medium text-primary-deep">
                Payment confirmed!
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Redirecting to your dashboard…
              </p>
              {signature && (
                <a
                  href={`https://solscan.io/tx/${signature}?cluster=devnet`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  View on Solscan <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          )}

          {stage === "error" && failure && (
            <div className="py-6 text-center">
              <XCircle className="mx-auto h-12 w-12 text-destructive" />
              <p className="mt-4 text-sm font-medium text-destructive">
                {FAILURE_COPY[failure]}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  onClick={onClose}
                  className="rounded-full border border-border bg-background py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRetry}
                  className="rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Retry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showWalletModal && (
        <WalletConnectionModal onClose={() => setShowWalletModal(false)} />
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
