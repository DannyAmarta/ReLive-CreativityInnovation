import { useMemo, useState } from "react";
import { PageHeader } from "@/components/trainer/PageHeader";
import { StatusBadge } from "@/components/trainer/StatusBadge";
import { EmptyState } from "@/components/trainer/EmptyState";
import {
  fmtIdr,
  fmtRelative,
  transactions as initialTx,
  wallet as initialWallet,
  type WalletTx,
} from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowDownToLine, RefreshCw, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Wallet() {
  const [wallet, setWallet] = useState(initialWallet);
  const [tx, setTx] = useState<WalletTx[]>(initialTx);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [pendingFilter, setPendingFilter] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // form
  const [destination, setDestination] = useState("bank");
  const [amount, setAmount] = useState<number>(500_000);

  const filtered = useMemo(
    () => (pendingFilter ? tx.filter((t) => t.status === "PENDING") : tx),
    [tx, pendingFilter]
  );

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success("Wallet refreshed");
    }, 700);
  };

  const submitWithdraw = () => {
    if (amount < 50_000) return toast.error("Minimum withdrawal is IDR 50,000");
    if (amount > wallet.balanceIdr) return toast.error("Amount exceeds available balance");
    const id = `TX-${Math.floor(Math.random() * 9000 + 1000)}`;
    const newTx: WalletTx = {
      id,
      type: "WITHDRAWAL",
      amountIdr: amount,
      status: "PENDING",
      description: destination === "bank" ? "Withdrawal to BCA •• 4521" : "Withdrawal to GoPay 0812-xxxx",
      createdAt: new Date().toISOString(),
    };
    setTx((xs) => [newTx, ...xs]);
    setWallet((w) => ({ ...w, balanceIdr: w.balanceIdr - amount, pendingIdr: w.pendingIdr + amount }));
    setShowWithdraw(false);
    toast.success("Withdrawal requested", { description: `${fmtIdr(amount)} pending` });
  };

  return (
    <div>
      <PageHeader
        title="Wallet"
        description="Your IDR balance, withdrawals and full transaction history."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={refresh} aria-label="Refresh">
              <RefreshCw className={cn("size-4", refreshing && "animate-spin")} />
            </Button>
            <Button onClick={() => setShowWithdraw(true)} className="bg-gradient-primary text-primary-foreground hover:opacity-90">
              <ArrowDownToLine className="size-4 mr-1.5" /> Withdraw
            </Button>
          </div>
        }
      />

      {/* Balance card */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="md:col-span-2 relative overflow-hidden rounded-2xl border border-border bg-gradient-primary text-primary-foreground p-6 shadow-elevated">
          <div className="absolute inset-0 grid-bg opacity-10" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <WalletIcon className="size-4" />
              <p className="text-xs uppercase tracking-wider opacity-80">Available balance</p>
            </div>
            <p className="text-4xl sm:text-5xl font-semibold font-mono tabular-nums">{fmtIdr(wallet.balanceIdr)}</p>
            <button
              onClick={() => setPendingFilter((p) => !p)}
              className="mt-4 inline-flex items-center gap-2 text-xs bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 transition-colors"
            >
              <span className="size-1.5 rounded-full bg-warning" />
              Pending: {fmtIdr(wallet.pendingIdr)}
              {pendingFilter && <span className="text-[10px] opacity-70">· filtering</span>}
            </button>
          </div>
        </div>
        <div className="glass-card-elevated p-6 flex flex-col justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Lifetime withdrawn</p>
          <p className="text-3xl font-semibold font-mono tabular-nums mt-2">{fmtIdr(wallet.lifetimeWithdrawnIdr)}</p>
          <p className="text-xs text-muted-foreground mt-2">Across all payouts</p>
        </div>
      </section>

      {/* History */}
      <div className="glass-card-elevated overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold">Transaction history</h2>
          {pendingFilter && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setPendingFilter(false)}>
              Clear filter
            </Button>
          )}
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={WalletIcon} title="No transactions" description="Your activity will appear here." />
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((t) => (
              <li key={t.id} className="px-5 py-3.5 flex items-center gap-4">
                <div className={cn(
                  "size-8 rounded-lg flex items-center justify-center shrink-0 border",
                  t.type === "CREDIT" ? "bg-success/10 border-success/20 text-success" : "bg-muted border-border text-muted-foreground"
                )}>
                  <ArrowDownToLine className={cn("size-3.5", t.type === "CREDIT" && "rotate-180")} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{t.description}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{t.id} · {fmtRelative(t.createdAt)}</p>
                </div>
                <div className="hidden sm:flex">
                  {t.status === "FAILED" && t.failureReason ? (
                    <TooltipProvider delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div><StatusBadge status="FAILED" /></div>
                        </TooltipTrigger>
                        <TooltipContent>{t.failureReason}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <StatusBadge status={t.status} />
                  )}
                </div>
                <p className={cn(
                  "text-sm font-mono tabular-nums font-medium w-32 text-right",
                  t.type === "CREDIT" ? "text-success" : "text-foreground"
                )}>
                  {t.type === "CREDIT" ? "+" : "−"}{fmtIdr(t.amountIdr).replace("IDR ", "")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw funds</DialogTitle>
            <DialogDescription>Funds typically arrive within 1–2 business days.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Destination</Label>
              <Select value={destination} onValueChange={setDestination}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank — BCA •• 4521</SelectItem>
                  <SelectItem value="ewallet">GoPay — 0812-xxxx-3344</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="amt">Amount (IDR)</Label>
              <Input id="amt" type="number" value={amount} onChange={(e) => setAmount(+e.target.value)} />
              <p className="text-[10px] text-muted-foreground">Available: {fmtIdr(wallet.balanceIdr)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdraw(false)}>Cancel</Button>
            <Button onClick={submitWithdraw} className="bg-gradient-primary text-primary-foreground">Confirm withdrawal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
