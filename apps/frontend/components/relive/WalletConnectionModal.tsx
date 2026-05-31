"use client";

import { X } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

// Wallet display metadata (purely cosmetic — adapter handles actual connection)
const WALLET_META: Record<string, { desc: string; color: string }> = {
  Phantom: { desc: "Most popular Solana wallet", color: "#AB9FF2" },
  Solflare: { desc: "Secure web & mobile wallet", color: "#FC9965" },
  Backpack: { desc: "xNFT-native wallet", color: "#E33E3F" },
  "Brave Wallet": { desc: "Brave's built-in crypto wallet", color: "#FF4724" },
};

export function WalletConnectionModal({ onClose }: { onClose: () => void }) {
  const { wallets, select } = useWallet();

  const handleConnect = (walletName: any) => {
    select(walletName);
    toast.success(`${walletName} selected — connecting...`);
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
          {wallets.map((wallet) => {
            const meta = WALLET_META[wallet.adapter.name] ?? {
              desc: `${wallet.adapter.name} wallet`,
              color: "#7c8b6e",
            };
            return (
              <button
                key={wallet.adapter.name}
                onClick={() => handleConnect(wallet.adapter.name)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: meta.color }}
                >
                  {wallet.adapter.name[0]}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{wallet.adapter.name}</p>
                  <p className="text-xs text-muted-foreground">{meta.desc}</p>
                </div>
                <span className="text-xs font-medium text-primary">Connect</span>
              </button>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Your wallet will never be charged without your approval.
        </p>
      </div>
    </div>
  );
}
