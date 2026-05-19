"use client";

import { useActionState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { saveTrainerServiceAction, ServiceFormState } from "@/lib/actions/marketplace";
import { lamportsToTokenUnits } from "@/lib/marketplace";

const initialState: ServiceFormState = { error: null };

// ─── Create Service Form ──────────────────────────────────────────────────────
export function CreateServiceForm() {
  const [state, formAction, isPending] = useActionState(saveTrainerServiceAction, initialState);

  return (
    <section className="glass-card-elevated p-5 mb-6">
      <div className="mb-4 flex items-center gap-2">
        <Plus className="size-4 text-primary" />
        <h2 className="text-sm font-semibold">Add service</h2>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Set at least one price. Clients will only see the booking button for payment methods you configure.
      </p>

      {state.error && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <form action={formAction} className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1.5 text-sm md:col-span-2">
          <span className="text-muted-foreground">Title</span>
          <input
            name="title"
            required
            disabled={isPending}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary disabled:opacity-50"
          />
        </label>
        <label className="space-y-1.5 text-sm md:col-span-2">
          <span className="text-muted-foreground">Description</span>
          <textarea
            name="description"
            required
            rows={3}
            disabled={isPending}
            className="w-full rounded-xl border border-border bg-background px-3 py-2.5 outline-none focus:border-primary disabled:opacity-50"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">
            💰 Price in IDR <span className="text-xs opacity-60">(optional)</span>
          </span>
          <input
            name="priceInIdr"
            type="number"
            min="50000"
            step="1"
            placeholder="e.g. 150000"
            disabled={isPending}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary disabled:opacity-50"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">
            🔗 Token price (USDC/SOL) <span className="text-xs opacity-60">(optional)</span>
          </span>
          <input
            name="priceInTokenUnits"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="e.g. 2.5"
            disabled={isPending}
            className="h-11 w-full rounded-xl border border-border bg-background px-3 outline-none focus:border-primary disabled:opacity-50"
          />
        </label>
        <div className="flex items-end md:col-span-2">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? "Creating…" : "Create service"}
          </button>
        </div>
      </form>
    </section>
  );
}

// ─── Edit Service Form ────────────────────────────────────────────────────────
export function EditServiceForm({
  service,
}: {
  service: {
    id: number;
    title: string;
    description: string;
    priceInLamports?: number | null;
    priceInIdr?: number | null;
  };
}) {
  const [state, formAction, isPending] = useActionState(saveTrainerServiceAction, initialState);

  const tokenUnits = service.priceInLamports ? service.priceInLamports / 1_000_000 : undefined;

  return (
    <form action={formAction} className="mt-4 grid gap-3">
      <input type="hidden" name="serviceId" value={service.id} />

      {state.error && (
        <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <label className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">Title</span>
        <input
          name="title"
          required
          defaultValue={service.title}
          disabled={isPending}
          className="h-11 w-full rounded-xl border border-border bg-card px-3 outline-none focus:border-primary disabled:opacity-50"
        />
      </label>
      <label className="space-y-1.5 text-sm">
        <span className="text-muted-foreground">Description</span>
        <textarea
          name="description"
          required
          defaultValue={service.description}
          rows={3}
          disabled={isPending}
          className="w-full rounded-xl border border-border bg-card px-3 py-2.5 outline-none focus:border-primary disabled:opacity-50"
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">
            💰 Price in IDR <span className="text-xs opacity-60">(optional)</span>
          </span>
          <input
            name="priceInIdr"
            type="number"
            min="50000"
            step="1"
            placeholder="Leave empty to remove IDR option"
            defaultValue={service.priceInIdr ?? undefined}
            disabled={isPending}
            className="h-11 w-full rounded-xl border border-border bg-card px-3 outline-none focus:border-primary disabled:opacity-50"
          />
        </label>
        <label className="space-y-1.5 text-sm">
          <span className="text-muted-foreground">
            🔗 Token price (USDC/SOL) <span className="text-xs opacity-60">(optional)</span>
          </span>
          <input
            name="priceInTokenUnits"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="Leave empty to remove Crypto option"
            defaultValue={tokenUnits}
            disabled={isPending}
            className="h-11 w-full rounded-xl border border-border bg-card px-3 outline-none focus:border-primary disabled:opacity-50"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
