import { useState } from "react";
import { Wallet, ChevronDown, LogOut } from "lucide-react";
import { actions, useStore } from "@/lib/store";
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
  const wallet = useStore((s) => s.wallet);
  const [open, setOpen] = useState(false);

  if (!wallet.connected) {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
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
        <button className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary-deep transition-colors hover:bg-primary/15">
          <span className="h-2 w-2 rounded-full bg-primary" />
          {truncateAddress(wallet.address)}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <div className="mb-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {wallet.provider}
          </p>
          <p className="font-mono text-sm text-foreground">
            {truncateAddress(wallet.address)}
          </p>
        </div>
        <div className="rounded-xl bg-muted px-3 py-2.5">
          <p className="text-xs text-muted-foreground">USDC balance</p>
          <p className="font-display text-lg font-bold text-primary">
            ${wallet.usdcBalance.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => {
            actions.disconnectWallet();
            toast("Wallet disconnected");
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