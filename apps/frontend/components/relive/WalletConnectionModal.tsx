import { X } from "lucide-react";
import { actions, type WalletProvider } from "@/lib/store";
import { toast } from "sonner";

const WALLETS: { id: WalletProvider; desc: string; color: string }[] = [
  { id: "Phantom", desc: "Most popular Solana wallet", color: "#AB9FF2" },
  { id: "Solflare", desc: "Secure web & mobile wallet", color: "#FC9965" },
  { id: "Backpack", desc: "xNFT-native wallet", color: "#E33E3F" },
];

export function WalletConnectionModal({ onClose }: { onClose: () => void }) {
  const handleConnect = (id: WalletProvider) => {
    actions.connectWallet(id);
    toast.success(`${id} connected`);
    onClose();
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
              Connect Solana Wallet
            </h2>
            <p className="text-sm text-muted-foreground">
              Pay with USDC on Solana.
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

        <div className="space-y-2">
          {WALLETS.map((w) => (
            <button
              key={w.id}
              onClick={() => handleConnect(w.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              <span
                className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: w.color }}
              >
                {w.id[0]}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{w.id}</p>
                <p className="text-xs text-muted-foreground">{w.desc}</p>
              </div>
              <span className="text-xs font-medium text-primary">Connect</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Your wallet will never be charged without your approval.
        </p>
      </div>
    </div>
  );
}
