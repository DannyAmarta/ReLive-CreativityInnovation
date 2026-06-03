import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, Wallet, X, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatUSDC } from "@/lib/format";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletConnectionModal } from "./WalletConnectionModal";
import { WalletAccountHelperModal } from "./WalletAccountHelperModal";
import { truncateAddress } from "./WalletButton";
import { toast } from "sonner";
import { useCryptoEscrow } from "@/hooks/features/marketplace/useCryptoEscrow";
import { createCryptoBookingWithoutRedirect } from "@/lib/actions/marketplace";

type Stage = "summary" | "signing" | "success" | "error";
type Failure = "rejected" | "insufficient" | "timeout";

const FAILURE_COPY: Record<Failure, string> = {
  rejected: "Transaction failed or was rejected in your wallet.",
  insufficient: "Insufficient USDC balance in your wallet.",
  timeout: "Transaction timed out. Please try again.",
};

export function CryptoBookingModal({
  service,
  trainerId,
  trainerName,
  slot,
  onClose,
}: {
  service: { id: number; title: string; priceInLamports: number | null };
  trainerId: number;
  trainerName: string;
  slot: { start: string; end: string };
  onClose: () => void;
}) {
  const navigate = useRouter();
  const { connected, publicKey, wallet } = useWallet();
  const address = publicKey?.toBase58();
  const { execute, isLoading, error: cryptoError } = useCryptoEscrow();
  
  const [stage, setStage] = useState<Stage>("summary");
  const [failure, setFailure] = useState<Failure | null>(null);
  const [backendErrorMsg, setBackendErrorMsg] = useState<string | null>(null);
  const [signature, setSignature] = useState<string>("");
  const [pendingBookingId, setPendingBookingId] = useState<number | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showWalletHelper, setShowWalletHelper] = useState(false);
  const [savedWalletAddress, setSavedWalletAddress] = useState<string | null>(null);
  const [isLoadingSavedWallet, setIsLoadingSavedWallet] = useState(true);
  const [isSavingWallet, setIsSavingWallet] = useState(false);

  const tokenUnits = service.priceInLamports ? service.priceInLamports / 1e6 : 0;
  const insufficient = false; // Trust the blockchain/wallet to handle balance checks
  const hasWalletMismatch =
    !!connected &&
    !!address &&
    !!savedWalletAddress &&
    savedWalletAddress !== address;
  const needsSavedWallet = !!connected && !!address && !savedWalletAddress;

  // Open wallet modal automatically if not connected
  useEffect(() => {
    if (!connected && stage === "summary") {
      setShowWalletModal(true);
    }
  }, [connected, stage]);

  useEffect(() => {
    if (stage !== "success") return;
    const t = setTimeout(() => {
      toast.success("Booking confirmed on Solana");
      onClose();
      navigate.push("/client/dashboard");
    }, 1800);
    return () => clearTimeout(t);
  }, [stage, navigate, onClose]);

  useEffect(() => {
    let ignore = false;

    async function loadSavedWallet() {
      setIsLoadingSavedWallet(true);
      try {
        const response = await fetch("/api/wallet-accounts", { cache: "no-store" });
        const payload = (await response.json()) as { savedWalletAddress?: string | null };
        if (!ignore) {
          setSavedWalletAddress(payload.savedWalletAddress ?? null);
        }
      } catch {
        if (!ignore) {
          setSavedWalletAddress(null);
        }
      } finally {
        if (!ignore) {
          setIsLoadingSavedWallet(false);
        }
      }
    }

    void loadSavedWallet();

    return () => {
      ignore = true;
    };
  }, []);

  const saveConnectedWallet = async () => {
    if (!connected || !address || !wallet?.adapter.name) return;

    setIsSavingWallet(true);
    try {
      const response = await fetch("/api/wallet-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: wallet.adapter.name.toUpperCase().includes("SOLFLARE")
            ? "SOLFLARE"
            : wallet.adapter.name.toUpperCase().includes("PHANTOM")
              ? "PHANTOM"
              : "OTHER",
          walletAddress: address,
          setActive: true,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error || "Unable to save your wallet address.");
      }

      setSavedWalletAddress(address);
      toast.success("Your ReLive wallet address was updated.");
      setShowWalletHelper(false);
    } catch (err: any) {
      toast.error(err?.message || "Unable to save your wallet address.");
    } finally {
      setIsSavingWallet(false);
    }
  };

  const handleDeposit = async () => {
    if (!connected) {
      setShowWalletModal(true);
      return;
    }
    if (hasWalletMismatch) {
      setShowWalletHelper(true);
      toast.error("Your connected wallet must match the wallet address saved in ReLive.");
      return;
    }
    if (needsSavedWallet) {
      setFailure("rejected");
      setBackendErrorMsg("Save your connected wallet as your ReLive wallet before paying.");
      setStage("error");
      return;
    }
    if (insufficient) {
      setFailure("insufficient");
      setStage("error");
      return;
    }
    
    setStage("signing");
    setFailure(null);
    setBackendErrorMsg(null);
    
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const bookingId =
        pendingBookingId ??
        (await createCryptoBookingWithoutRedirect(
          trainerId,
          service.id,
          slot.start,
          slot.end,
          timezone
        ));
      setPendingBookingId(bookingId);

      const sig = await execute(bookingId, "deposit");
      setSignature(sig);
      setStage("success");
    } catch (err: any) {
      console.error("Booking error:", err);
      setFailure("rejected");
      setBackendErrorMsg(err?.message || cryptoError || null);
      setStage("error");
    }
  };

  const handleRetry = () => {
    setFailure(null);
    setBackendErrorMsg(null);
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
                {stage === "success" && "Payment confirmed"}
                {stage === "error" && "Transaction failed"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {service.title} · {trainerName}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading || stage === "signing"}
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted disabled:opacity-50"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {stage === "summary" && (
            <>
              <div className="space-y-1 rounded-2xl bg-muted p-4 text-sm">
                <Row label="Trainer" value={trainerName} />
                <Row label="Service" value={service.title} />
              </div>

              <div className="mt-3 rounded-2xl bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total deposit</span>
                  <span className="font-display text-2xl font-bold text-primary">
                    {formatUSDC(tokenUnits)}
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
                    {connected ? truncateAddress(address) : "Not connected"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (connected) {
                      setShowWalletHelper(true);
                      return;
                    }
                    setShowWalletModal(true);
                  }}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  {connected ? "Change" : "Connect"}
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl border border-dashed border-border px-3 py-2.5 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Saved in ReLive</p>
                  <p className="font-mono text-foreground">
                    {isLoadingSavedWallet
                      ? "Loading..."
                      : savedWalletAddress
                        ? truncateAddress(savedWalletAddress)
                        : "Not set yet"}
                  </p>
                </div>
                {connected && address && (
                  <button
                    onClick={() => void saveConnectedWallet()}
                    disabled={isSavingWallet}
                    className="text-xs font-medium text-primary hover:underline disabled:opacity-50"
                  >
                    {isSavingWallet
                      ? "Saving..."
                      : savedWalletAddress
                        ? "Use connected"
                        : "Save wallet"}
                  </button>
                )}
              </div>

              {hasWalletMismatch && (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  Your connected signer wallet does not match the wallet address saved in ReLive.
                  Update your saved wallet to this signer, or reconnect the correct wallet before paying.
                </div>
              )}

              {needsSavedWallet && (
                <div className="mt-3 rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary-deep">
                  Save your connected wallet as your ReLive wallet first. Crypto checkout now uses your saved ReLive wallet address as the expected signer.
                </div>
              )}

              {insufficient && (
                <p className="mt-3 text-xs text-destructive">
                  Insufficient USDC. You need at least {formatUSDC(tokenUnits)}.
                </p>
              )}

              <button
                onClick={handleDeposit}
                disabled={!connected || insufficient || isLoading || hasWalletMismatch || needsSavedWallet || isSavingWallet}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Wallet className="h-4 w-4" />
                {needsSavedWallet ? "Save Wallet First" : hasWalletMismatch ? "Wallet Mismatch" : "Deposit & Book"}
              </button>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="mt-2 w-full text-center text-xs text-muted-foreground hover:underline disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          )}

          {stage === "signing" && (
            <div className="py-6 text-center">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium text-primary-deep">
                Please wait...
              </p>
              <p className="mt-1 text-xs text-muted-foreground px-4">
                Check your wallet extension. You may need to approve the transaction.
              </p>
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

              {stage === "error" && (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <XCircle className="mb-4 h-12 w-12 text-destructive" />
                  <p className="text-sm font-medium text-destructive">
                    {backendErrorMsg || (failure ? FAILURE_COPY[failure] : "An unknown error occurred.")}
                  </p>
                  <div className="mt-6 flex w-full gap-3">
                    <button
                      onClick={onClose}
                      className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRetry}
                      className="flex-1 rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:bg-foreground/90"
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

      {showWalletHelper && (
        <WalletAccountHelperModal
          title="Use or change client wallet"
          description="Your connected signer wallet should match the wallet address you have saved in ReLive before crypto payment."
          connectedWalletAddress={address}
          savedWalletAddress={savedWalletAddress}
          useConnectedLabel="Keep using this wallet"
          onUseConnectedWallet={() => setShowWalletHelper(false)}
          onClose={() => setShowWalletHelper(false)}
        />
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
