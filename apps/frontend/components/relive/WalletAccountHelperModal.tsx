"use client";

import { useEffect, useMemo, useState } from "react";
import { useWallet, type Wallet as AdapterWallet } from "@solana/wallet-adapter-react";
import type { WalletName } from "@solana/wallet-adapter-base";
import { ArrowLeft, ExternalLink, LogOut, Plus, RefreshCcw, Wallet, X } from "lucide-react";
import { toast } from "sonner";

const WALLET_META: Record<string, { desc: string; color: string }> = {
  Phantom: { desc: "Most popular Solana wallet", color: "#AB9FF2" },
  Solflare: { desc: "Secure web and mobile wallet", color: "#FC9965" },
  Backpack: { desc: "xNFT-native wallet", color: "#E33E3F" },
  "Brave Wallet": { desc: "Brave built-in crypto wallet", color: "#FF4724" },
};

type RememberedWalletAccount = {
  id: number;
  provider: string;
  walletAddress: string;
  isActive: boolean;
  lastUsedAt: string;
  createdAt: string;
};

function truncateAddress(value?: string | null) {
  return value ? `${value.slice(0, 4)}...${value.slice(-4)}` : "";
}

function getWalletInitial(value?: string | null) {
  return value ? value.slice(0, 1).toUpperCase() : "W";
}

function formatWalletTimestamp(value?: string) {
  if (!value) return "Saved in ReLive";

  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return "Saved in ReLive";

  const minutesAgo = Math.max(0, Math.floor((Date.now() - parsed) / 60000));
  if (minutesAgo < 1) return "Used just now";
  if (minutesAgo === 1) return "Used 1 minute ago";
  if (minutesAgo < 60) return `Used ${minutesAgo} minutes ago`;

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo === 1) return "Used 1 hour ago";
  if (hoursAgo < 24) return `Used ${hoursAgo} hours ago`;

  const daysAgo = Math.floor(hoursAgo / 24);
  return daysAgo === 1 ? "Used 1 day ago" : `Used ${daysAgo} days ago`;
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

async function hardResetWalletSelection(providerName?: string) {
  window.localStorage.removeItem("walletName");
  window.sessionStorage.removeItem("walletName");

  const walletWindow = window as Window & {
    solflare?: { disconnect?: () => Promise<void> | void };
    solana?: { disconnect?: () => Promise<void> | void; isPhantom?: boolean };
  };

  if (providerName?.toLowerCase().includes("solflare")) {
    await walletWindow.solflare?.disconnect?.();
  }

  if (providerName?.toLowerCase().includes("phantom") || walletWindow.solana?.isPhantom) {
    await walletWindow.solana?.disconnect?.();
  }
}

export function WalletAccountHelperModal({
  title,
  description,
  connectedWalletAddress,
  savedWalletAddress,
  useConnectedLabel,
  onUseConnectedWallet,
  onClose,
}: {
  title: string;
  description: string;
  connectedWalletAddress?: string | null;
  savedWalletAddress?: string | null;
  useConnectedLabel: string;
  onUseConnectedWallet?: () => void;
  onClose: () => void;
}) {
  const { disconnect, select, wallet, wallets } = useWallet();
  const [view, setView] = useState<"accounts" | "add-account" | "providers" | "reconnect">("accounts");
  const [pendingFreshProvider, setPendingFreshProvider] = useState<"SOLFLARE" | "PHANTOM" | null>(null);
  const [rememberedAccounts, setRememberedAccounts] = useState<RememberedWalletAccount[]>([]);
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  const currentProviderName = wallet?.adapter.name ?? "Wallet";
  const currentProviderMeta = WALLET_META[currentProviderName] ?? {
    desc: `${currentProviderName} wallet`,
    color: "#7c8b6e",
  };
  const currentOrSavedAddress = connectedWalletAddress || savedWalletAddress;

  const visibleRememberedAccounts = useMemo(
    () =>
      rememberedAccounts.filter(
        (account) => account.walletAddress !== connectedWalletAddress,
      ),
    [rememberedAccounts, connectedWalletAddress],
  );

  const otherProviders = useMemo(
    () => wallets.filter((walletOption) => walletOption.adapter.name !== wallet?.adapter.name),
    [wallets, wallet?.adapter.name],
  );

  useEffect(() => {
    let ignore = false;

    async function loadRememberedAccounts() {
      setIsLoadingAccounts(true);
      try {
        const response = await fetch("/api/wallet-accounts", { cache: "no-store" });
        const payload = (await response.json()) as {
          walletAccounts?: RememberedWalletAccount[];
        };

        if (!ignore) {
          setRememberedAccounts(payload.walletAccounts ?? []);
        }
      } catch {
        if (!ignore) {
          setRememberedAccounts([]);
        }
      } finally {
        if (!ignore) {
          setIsLoadingAccounts(false);
        }
      }
    }

    void loadRememberedAccounts();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConnectProvider = async (walletOption: AdapterWallet) => {
    await disconnect().catch(() => undefined);
    await hardResetWalletSelection(wallet?.adapter.name);
    select(null);
    select(walletOption.adapter.name as WalletName);
    await walletOption.adapter.connect().catch(() => undefined);
    const publicKey = walletOption.adapter.publicKey?.toBase58();
    if (publicKey) {
      await rememberWalletAccount(walletOption.adapter.name, publicKey).catch(() => undefined);
    }
    toast.success(`${walletOption.adapter.name} selected. Continue in your wallet extension.`);
    onClose();
  };

  const handleFreshProviderFlow = async (providerName: "SOLFLARE" | "PHANTOM") => {
    await disconnect().catch(() => undefined);
    await hardResetWalletSelection(wallet?.adapter.name);
    select(null);
    setPendingFreshProvider(providerName);
    setView("reconnect");

    const href =
      providerName === "SOLFLARE" ? "https://solflare.com/onboard" : "https://phantom.app/";
    window.open(href, "_blank", "noopener,noreferrer");

    toast(
      `Finish creating, logging in, or switching accounts in ${providerName}, then come back here and reconnect.`,
    );
  };

  const handleReconnectFreshProvider = async () => {
    if (!pendingFreshProvider) return;

    const providerWallet = wallets.find((walletOption) =>
      walletOption.adapter.name.toUpperCase().includes(pendingFreshProvider),
    );

    if (!providerWallet) {
      toast.error(`${pendingFreshProvider} is not available in this browser right now.`);
      return;
    }

    select(null);
    select(providerWallet.adapter.name as WalletName);
    await providerWallet.adapter.connect().catch(() => undefined);
    const publicKey = providerWallet.adapter.publicKey?.toBase58();
    if (publicKey) {
      await rememberWalletAccount(providerWallet.adapter.name, publicKey).catch(() => undefined);
    }
    toast.success(`${providerWallet.adapter.name} reconnected.`);
    onClose();
  };

  const handleDisconnectWallet = async () => {
    await disconnect().catch(() => undefined);
    await hardResetWalletSelection(wallet?.adapter.name);
    select(null);
    toast("Wallet disconnected.");
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[60] grid place-items-end bg-black/35 p-0 backdrop-blur-sm md:place-items-center md:p-4"
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-t-[2rem] bg-card text-foreground shadow-[0_30px_80px_rgba(0,0,0,0.22)] md:rounded-[2rem]"
      >
        <div className="relative border-b border-border px-6 pb-6 pt-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          <p className="mx-auto max-w-[240px] truncate text-sm font-medium text-primary-deep">
            {currentOrSavedAddress || "Wallet session"}
          </p>

          <div className="mx-auto mt-5 grid h-24 w-24 place-items-center rounded-full border-2 border-primary/20 bg-primary/5 text-3xl font-semibold text-primary-deep">
            {getWalletInitial(currentOrSavedAddress)}
          </div>

          <h2 className="mt-4 text-[1.75rem] font-semibold leading-none text-primary-deep">
            {view === "accounts"
              ? title
              : view === "add-account"
                ? "Add another account"
                : view === "reconnect"
                  ? `Reconnect ${pendingFreshProvider === "SOLFLARE" ? "Solflare" : "Phantom"}`
                : "Choose another wallet provider"}
          </h2>
          <p className="mx-auto mt-3 max-w-[290px] text-sm leading-relaxed text-muted-foreground">
            {view === "accounts"
              ? description
              : view === "add-account"
                ? "Choose how you want to start a fresh Solana wallet connection flow."
                : view === "reconnect"
                  ? `After you finish switching, logging in, or creating an account in ${pendingFreshProvider === "SOLFLARE" ? "Solflare" : "Phantom"}, come back here and reconnect with the address you want to use.`
                : "Choose a different wallet app. If you want another account in the same app, go back and start that provider's fresh flow first."}
          </p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-primary-deep">
            <Wallet className="size-4" />
            {currentProviderName}
          </div>
        </div>

        <div className="space-y-3 p-4">
          {view === "accounts" ? (
            <>
              <div className="overflow-hidden rounded-[1.6rem] border border-border bg-background/70">
                <div className="flex items-center justify-between bg-muted/50 px-4 py-3 text-sm font-medium text-primary-deep">
                  <span>Accounts</span>
                  <span className="text-xs text-muted-foreground">ReLive</span>
                </div>

                <div className="space-y-1 p-2">
                  <div className="flex items-center gap-3 rounded-2xl px-3 py-3">
                    <div
                      className="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: currentProviderMeta.color }}
                    >
                      {getWalletInitial(currentOrSavedAddress)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {truncateAddress(currentOrSavedAddress)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {currentProviderName} • Connected
                      </p>
                    </div>
                    <span className="text-xs font-medium text-primary">Current</span>
                  </div>

                  {isLoadingAccounts ? (
                    <div className="px-4 py-4 text-sm text-muted-foreground">
                      Loading remembered wallets...
                    </div>
                  ) : visibleRememberedAccounts.length > 0 ? (
                    visibleRememberedAccounts.map((account) => {
                      const providerMeta = WALLET_META[account.provider] ?? {
                        desc: `${account.provider} wallet`,
                        color: "#7c8b6e",
                      };

                      return (
                        <button
                          key={account.id}
                          type="button"
                          onClick={async () => {
                            const providerWallet = wallets.find((walletOption) =>
                              walletOption.adapter.name.toUpperCase().includes(account.provider),
                            );

                            if (!providerWallet) {
                              toast.error(
                                `${account.provider} is not available in this browser right now.`,
                              );
                              return;
                            }

                            await handleConnectProvider(providerWallet);
                            toast(
                              `Reconnect ${account.provider} with ${truncateAddress(account.walletAddress)} selected in the wallet app.`,
                            );
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-colors hover:bg-muted/70"
                        >
                          <div
                            className="grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-white"
                            style={{ backgroundColor: providerMeta.color }}
                          >
                            {getWalletInitial(account.walletAddress)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {truncateAddress(account.walletAddress)}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {account.provider} • {formatWalletTimestamp(account.lastUsedAt)}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">Saved</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-4 py-4 text-sm text-muted-foreground">
                      No extra wallet accounts have been remembered in ReLive yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="grid gap-2">
                {connectedWalletAddress && onUseConnectedWallet && (
                  <button
                    type="button"
                    onClick={() => {
                      onUseConnectedWallet();
                      toast(useConnectedLabel);
                      onClose();
                    }}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
                  >
                    <RefreshCcw className="size-4" />
                    {useConnectedLabel}
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleDisconnectWallet}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
                >
                  <LogOut className="size-4" />
                  Disconnect wallet
                </button>

                <button
                  type="button"
                  onClick={() => setView("add-account")}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
                >
                  <Plus className="size-4" />
                  Add another account
                </button>
              </div>
            </>
          ) : view === "add-account" ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setView("accounts")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>

              <button
                type="button"
                onClick={() => void handleFreshProviderFlow("SOLFLARE")}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: WALLET_META.Solflare.color }}
                >
                  S
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Add another Solflare account</p>
                  <p className="text-xs text-muted-foreground">
                    Start a fresh Solflare flow to switch or log into another address.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => void handleFreshProviderFlow("PHANTOM")}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span
                  className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: WALLET_META.Phantom.color }}
                >
                  P
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Add another Phantom account</p>
                  <p className="text-xs text-muted-foreground">
                    Start a fresh Phantom flow to switch or log into another address.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setView("providers")}
                className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-muted-foreground">
                  <ExternalLink className="size-4" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground">Use another wallet provider</p>
                  <p className="text-xs text-muted-foreground">
                    Go back to the normal fresh Solana wallet flow and choose another provider.
                  </p>
                </div>
              </button>
            </div>
          ) : view === "reconnect" ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setView("add-account")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>

              <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                A fresh browser handoff was opened for {pendingFreshProvider === "SOLFLARE" ? "Solflare" : "Phantom"}.
                Once you have the correct account active there, reconnect below.
              </div>

              <button
                type="button"
                onClick={() => void handleReconnectFreshProvider()}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
              >
                <RefreshCcw className="size-4" />
                Reconnect {pendingFreshProvider === "SOLFLARE" ? "Solflare" : "Phantom"}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setView("add-account")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>

              {otherProviders.length > 0 ? (
                otherProviders.map((walletOption) => {
                  const meta = WALLET_META[walletOption.adapter.name] ?? {
                    desc: `${walletOption.adapter.name} wallet`,
                    color: "#7c8b6e",
                  };

                  return (
                    <button
                      key={walletOption.adapter.name}
                      type="button"
                      onClick={() => void handleConnectProvider(walletOption)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
                    >
                      <span
                        className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold text-white"
                        style={{ backgroundColor: meta.color }}
                      >
                        {walletOption.adapter.name[0]}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">
                          {walletOption.adapter.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{meta.desc}</p>
                      </div>
                      <span className="text-xs font-medium text-primary">Connect</span>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground">
                  No other wallet providers are available in this browser right now.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
