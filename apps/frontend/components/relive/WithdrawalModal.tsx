import { useState } from "react";
import { ArrowLeft, Building2, Smartphone, X } from "lucide-react";
import { BANKS, type WithdrawalMethod } from '@/lib/fiat-mock-data';
import { actions } from "@/lib/store";
import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const MIN = 50_000;

export function WithdrawalModal({
  balance,
  hasPending,
  onClose,
  prefill,
}: {
  balance: number;
  hasPending: boolean;
  onClose: () => void;
  prefill?: {
    method: WithdrawalMethod;
    amount: number;
    bankCode?: string;
    accountNumber?: string;
    accountName?: string;
    ewalletPhone?: string;
  };
}) {
  const [method, setMethod] = useState<WithdrawalMethod>(prefill?.method ?? "BANK_TRANSFER");
  const [bankCode, setBankCode] = useState(prefill?.bankCode ?? BANKS[0]);
  const [accountNumber, setAccountNumber] = useState(prefill?.accountNumber ?? "");
  const [accountName, setAccountName] = useState(prefill?.accountName ?? "");
  const [phone, setPhone] = useState(prefill?.ewalletPhone ?? "");
  const [amount, setAmount] = useState<string>(String(prefill?.amount ?? ""));
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "confirm">("form");
  const [confirmed, setConfirmed] = useState(false);

  const amt = Number(amount) || 0;
  let amountError = "";
  if (amount && amt < MIN) amountError = `Minimum withdrawal is ${formatIDR(MIN)}`;
  else if (amt > balance) amountError = "Amount exceeds your balance";

  const fieldsValid =
    method === "BANK_TRANSFER"
      ? !!bankCode && accountNumber.trim().length > 4 && accountName.trim().length > 1
      : phone.trim().length >= 9;

  const canProceed = !hasPending && !amountError && amt >= MIN && fieldsValid && !submitting;

  const goConfirm = () => {
    if (!canProceed) return;
    setStep("confirm");
  };

  const submit = () => {
    if (!confirmed || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      actions.addWithdrawal({
        id: `w_${Date.now()}`,
        amountIdr: amt,
        status: "PENDING",
        method,
        reference: `DUITKU-${Math.random().toString(36).slice(2, 10)}`,
        createdAt: new Date().toISOString(),
        ...(method === "BANK_TRANSFER"
          ? { bankCode, accountNumber, accountName }
          : { ewalletPhone: phone }),
      });
      toast.success("Withdrawal requested", {
        description: "Funds will be sent shortly.",
      });
      setSubmitting(false);
      onClose();
    }, 700);
  };

  const destinationLabel =
    method === "BANK_TRANSFER"
      ? `${bankCode} •••• ${accountNumber.slice(-4)}`
      : `E-Wallet ${phone.replace(/(\d{4})\d+(\d{3})/, "$1•••$2")}`;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-end bg-foreground/30 p-0 backdrop-blur-sm md:place-items-center md:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-t-3xl bg-card p-6 shadow-[var(--shadow-lift)] md:rounded-3xl"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-primary-deep">
              {step === "form" ? "Withdraw IDR" : "Confirm withdrawal"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Available balance: {formatIDR(balance)}
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

        {step === "form" && hasPending && (
          <div className="mb-4 rounded-xl bg-warning/15 p-3 text-xs text-foreground">
            You already have a pending withdrawal. Please wait for it to complete.
          </div>
        )}

        {step === "form" ? (
          <>
        <Label>Method</Label>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <MethodCard
            active={method === "BANK_TRANSFER"}
            onClick={() => setMethod("BANK_TRANSFER")}
            icon={<Building2 className="h-5 w-5" />}
            label="Bank Transfer"
          />
          <MethodCard
            active={method === "EWALLET"}
            onClick={() => setMethod("EWALLET")}
            icon={<Smartphone className="h-5 w-5" />}
            label="E-Wallet"
            sub="GoPay / OVO"
          />
        </div>

        <div className="mt-5 space-y-4">
          {method === "BANK_TRANSFER" ? (
            <>
              <Field label="Bank">
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                >
                  {BANKS.map((b) => <option key={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Account number">
                <input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  inputMode="numeric"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </Field>
              <Field label="Account name">
                <input
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </Field>
            </>
          ) : (
            <Field label="Phone number">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="0812xxxxxxx"
                inputMode="numeric"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </Field>
          )}

          <Field label="Amount (IDR)">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              placeholder="50000"
              className={cn(
                "h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary",
                amountError ? "border-destructive" : "border-border",
              )}
            />
            {amountError && (
              <p className="mt-1.5 text-xs text-destructive">{amountError}</p>
            )}
          </Field>
        </div>

        <button
          onClick={goConfirm}
          disabled={!canProceed}
          className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Review withdrawal
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Bank transfers take 1–2 business days. E-wallet withdrawals are instant.
        </p>
          </>
        ) : (
          <div>
            <div className="space-y-3 rounded-2xl border border-border bg-muted/40 p-4 text-sm">
              <Row label="Method" value={method === "BANK_TRANSFER" ? "Bank Transfer" : "E-Wallet"} />
              <Row label="Destination" value={destinationLabel} />
              {method === "BANK_TRANSFER" && <Row label="Account name" value={accountName} />}
              <Row label="Amount" value={formatIDR(amt)} />
              <Row label="Fee" value="None" />
              <div className="border-t border-border pt-3">
                <Row label="Total to deduct" value={formatIDR(amt)} bold />
              </div>
            </div>
            <label className="mt-4 flex items-start gap-2 text-xs text-foreground">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              />
              <span>I confirm the account details are correct.</span>
            </label>
            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setStep("form")}
                disabled={submitting}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border px-5 py-3 text-sm font-semibold text-primary-deep hover:bg-muted disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                onClick={submit}
                disabled={!confirmed || submitting}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Confirm & Withdraw"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-foreground", bold && "font-display font-bold text-primary-deep")}>{value}</span>
    </div>
  );
}
function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
function MethodCard({
  active, onClick, icon, label, sub,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start gap-1 rounded-2xl border p-4 text-left transition-all",
        active ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "border-border bg-card hover:border-primary/40",
      )}
    >
      <span className={cn("grid h-9 w-9 place-items-center rounded-full", active ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
        {icon}
      </span>
      <span className="mt-1 text-sm font-semibold text-primary-deep">{label}</span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </button>
  );
}
