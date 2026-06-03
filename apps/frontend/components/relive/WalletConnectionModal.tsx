"use client";

import { X } from "lucide-react";
import { useWallet, type Wallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner";

const WALLET_META: Record<string, { desc: string; color: string }> = {
  Phantom: { desc: "Most popular Solana wallet", color: "#AB9FF2" },
  Solflare: { desc: "Secure web and mobile wallet", color: "#FC9965" },
  Backpack: { desc: "xNFT-native wallet", color: "#E33E3F" },
  "Brave Wallet": { desc: "Brave built-in crypto wallet", color: "#FF4724" },
};

async function hardResetWalletSelection(walletOption?: Wallet) {
  window.localStorage.removeItem("walletName");
  window.sessionStorage.removeItem("walletName");

  if (!walletOption) return;

  await walletOption.adapter.disconnect().catch(() => undefined);

  const providerName = walletOption.adapter.name.toLowerCase();
  const walletWindow = window as Window & {
    solflare?: { disconnect?: () => Promise<void> | void };
    solana?: { disconnect?: () => Promise<void> | void; isPhantom?: boolean };
  };

  if (providerName.includes("solflare")) {
    await walletWindow.solflare?.disconnect?.();
  }

  if (providerName.includes("phantom") || walletWindow.solana?.isPhantom) {
    await walletWindow.solana?.disconnect?.();
  }
}

async function rememberWalletAccount(provider: string, walletAddress: string) {
  await fetch("/api/wallet-accounts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      provider: provider.toUpperCase().includes("SOLFLARE")
        ? "SOLFLARE"
        : provider.toUpperCase().includes("PHANTOM")
          ? "PHANTOM"
          : "OTHER",
      walletAddress,
      setActive: true,
    }),
  });
}

export function WalletConnectionModal({ onClose }: { onClose: () => void }) {
  const { wallets, select } = useWallet();

  const handleConnect = async (walletOption: Wallet) => {
    try {
      await hardResetWalletSelection(walletOption);
      select(null);
      select(walletOption.adapter.name);
      await walletOption.adapter.connect();
      const publicKey = walletOption.adapter.publicKey?.toBase58();
      if (publicKey) {
        await rememberWalletAccount(walletOption.adapter.name, publicKey).catch(() => undefined);
      }
      toast.success(`${walletOption.adapter.name} connected.`);
      onClose();
    } catch (error) {
      console.error("Wallet connect error:", error);
      toast.error(
        `Could not connect ${walletOption.adapter.name}. Check the wallet extension and try again.`,
      );
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-end bg-foreground/30 p-0 backdrop-blur-sm md:place-items-center md:p-4"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl bg-card p-6 shadow-[var(--shadow-lift)] md:rounded-3xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-primary-deep">
              Connect Solana Wallet
            </h2>
            <p className="text-sm text-muted-foreground">Pay with USDC on Solana.</p>
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
          {wallets.map((walletOption) => {
            const meta = WALLET_META[walletOption.adapter.name] ?? {
              desc: `${walletOption.adapter.name} wallet`,
              color: "#7c8b6e",
            };

            return (
              <button
                key={walletOption.adapter.name}
                onClick={() => handleConnect(walletOption)}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: meta.color }}
                >
                  {walletOption.adapter.name[0]}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">{walletOption.adapter.name}</p>
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
        <p className="mt-2 text-xs text-muted-foreground">
          If you want another account in the same wallet app, switch the active account inside the
          extension first, then connect again here.
        </p>
      </div>
    </div>
  );
}
