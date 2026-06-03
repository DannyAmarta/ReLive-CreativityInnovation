"use client";

import { useState } from "react";
import { Wallet, ChevronDown, LogOut } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletConnectionModal } from "./WalletConnectionModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

export const truncateAddress = (a?: string) =>
  !a ? "" : `${a.slice(0, 4)}…${a.slice(-4)}`;

export function WalletButton() {
  const { connected, publicKey, disconnect, wallet, select } = useWallet();
  const [open, setOpen] = useState(false);

  const address = publicKey?.toBase58();

  if (!connected || !address) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-[#4a5d3e] px-4 py-2 text-sm font-semibold text-[#f8f6ef] shadow-[0_12px_24px_rgba(74,93,62,0.16)] transition-opacity hover:opacity-92"
        >
          <Wallet className="h-4 w-4" />
          Connect Wallet
        </button>
        {open && <WalletConnectionModal onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-full border border-[rgba(74,93,62,0.18)] bg-[rgba(255,252,246,0.9)] px-3 py-2 text-sm font-medium text-primary-deep transition-colors hover:bg-[rgba(234,240,225,0.85)]">
          <span className="h-2 w-2 rounded-full bg-[#4a5d3e]" />
          {truncateAddress(address)}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="mb-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {wallet?.adapter.name ?? "Wallet"}
          </p>
          <p className="font-mono text-sm text-foreground">
            {truncateAddress(address)}
          </p>
        </div>
        <button
          onClick={async () => {
            await disconnect();
            select(null);
            toast("Wallet disconnected. Choose a wallet again when you are ready.");
          }}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
        >
          <LogOut className="h-4 w-4" />
          Disconnect
        </button>
      </PopoverContent>
    </Popover>
  );
}
