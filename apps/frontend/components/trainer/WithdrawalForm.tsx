"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ArrowDownToLine, Loader2 } from "lucide-react";
import { requestFiatWithdrawalAction } from "@/lib/actions/marketplace";

export function WithdrawalForm() {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // ⚠️ Show the dev-mode warning toast FIRST — before the action runs
    toast.warning("Development Mode — Withdrawal is simulated", {
      description:
        "Real bank disbursement (Duitku Disbursement API) is not yet integrated. " +
        "Your virtual balance will be deducted then automatically refunded when the dummy API call fails.",
      duration: 8000,
    });

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await requestFiatWithdrawalAction(formData);
        toast.success("Withdrawal request recorded", {
          description:
            "The virtual balance has been updated. In production this would wire funds to your bank.",
        });
      } catch (err) {
        // Next.js redirect() throws — ignore it; other errors show as error toasts
        const message = err instanceof Error ? err.message : String(err);
        if (!message.includes("NEXT_REDIRECT")) {
          toast.error("Withdrawal failed", { description: message });
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      {/* Dev-mode banner */}
      <div className="md:col-span-2 flex items-start gap-2.5 rounded-xl border border-amber-300/40 bg-amber-50/50 dark:bg-amber-900/20 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
        <span className="text-base">⚠️</span>
        <p>
          <strong>Development mode:</strong> Withdrawals are simulated. Real bank
          payouts require the Duitku Disbursement API, which is not yet integrated.
          Funds will <em>not</em> actually be sent to any account.
        </p>
      </div>

      <label className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">Amount (IDR)</span>
        <input
          name="amountIdr"
          type="number"
          min="50000"
          step="1000"
          required
          disabled={isPending}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary disabled:opacity-50"
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">Method</span>
        <select
          name="paymentMethod"
          defaultValue="BANK_TRANSFER"
          disabled={isPending}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary disabled:opacity-50"
        >
          <option value="BANK_TRANSFER">Bank transfer</option>
          <option value="EWALLET">E-wallet</option>
        </select>
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">Bank code</span>
        <input
          name="bankCode"
          defaultValue="BCA"
          disabled={isPending}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary disabled:opacity-50"
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">Account number</span>
        <input
          name="accountNumber"
          disabled={isPending}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary disabled:opacity-50"
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">Account name</span>
        <input
          name="accountName"
          disabled={isPending}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary disabled:opacity-50"
        />
      </label>

      <label className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">E-wallet phone</span>
        <input
          name="ewalletPhone"
          placeholder="62812xxxxxxx"
          disabled={isPending}
          className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary disabled:opacity-50"
        />
      </label>

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Processing…
            </>
          ) : (
            <>
              <ArrowDownToLine className="size-4" />
              Submit withdrawal
            </>
          )}
        </button>
      </div>
    </form>
  );
}
