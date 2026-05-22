"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Clock, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AvailabilityRule } from "@/lib/actions/availability";
import {
  createAvailabilityRuleAction,
  updateAvailabilityRuleAction,
  deleteAvailabilityRuleAction,
} from "@/lib/actions/availability";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getRuleForDay(rules: AvailabilityRule[], dow: number) {
  return rules.find((r) => r.dayOfWeek === dow && !r.specificDate) ?? null;
}

function getRuleForDate(rules: AvailabilityRule[], dateStr: string) {
  return rules.find((r) => r.specificDate && r.specificDate.slice(0, 10) === dateStr) ?? null;
}

// ─── Add Override Modal ───────────────────────────────────────────────────────
function AddOverrideModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (input: {
    specificDate: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    title?: string;
  }) => Promise<void>;
}) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isAvailable, setIsAvailable] = useState(true);
  const [title, setTitle] = useState("");
  const [isPending, start] = useTransition();

  function submit() {
    if (!date) return toast.error("Please pick a date");
    start(async () => {
      await onAdd({ specificDate: date, startTime, endTime, isAvailable, title: title || undefined });
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-card shadow-2xl p-6 space-y-5">
        <h3 className="font-display text-lg font-bold text-primary-deep">Add Date Override</h3>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#4a5d3e] focus:ring-2 focus:ring-[rgba(74,93,62,0.2)]" />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setIsAvailable(true)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${isAvailable ? "bg-[#4a5d3e] text-white" : "border border-border text-muted-foreground hover:bg-muted"}`}>
              Available
            </button>
            <button onClick={() => setIsAvailable(false)}
              className={`flex-1 rounded-xl py-2 text-sm font-semibold transition-colors ${!isAvailable ? "bg-destructive text-white" : "border border-border text-muted-foreground hover:bg-muted"}`}>
              Blocked
            </button>
          </div>

          {isAvailable && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Start</label>
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#4a5d3e]" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">End</label>
                <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#4a5d3e]" />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Label (optional)</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder='e.g. "On Vacation", "Conference"'
              className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#4a5d3e]" />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-border py-2.5 text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">
            Cancel
          </button>
          <button onClick={submit} disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#4a5d3e] py-2.5 text-sm font-semibold text-white hover:bg-[#3a4d2e] transition-colors disabled:opacity-50">
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Day Row (weekly schedule) ────────────────────────────────────────────────
function DayRow({
  dow,
  rule,
  onToggle,
  onTimeChange,
}: {
  dow: number;
  rule: AvailabilityRule | null;
  onToggle: (dow: number, currentRule: AvailabilityRule | null) => Promise<void>;
  onTimeChange: (ruleId: number, startTime: string, endTime: string) => Promise<void>;
}) {
  const [isPending, start] = useTransition();
  const isActive = rule?.isAvailable ?? false;

  return (
    <div className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${isActive ? "border-[rgba(74,93,62,0.25)] bg-[rgba(74,93,62,0.04)]" : "border-border bg-muted/20"}`}>
      <div className="w-12 shrink-0 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{DAY_SHORT[dow]}</p>
        <p className="text-xs text-muted-foreground">{DAYS[dow].slice(0, 3)}</p>
      </div>

      <button
        onClick={() => start(() => onToggle(dow, rule))}
        disabled={isPending}
        className="shrink-0 transition-opacity disabled:opacity-50"
      >
        {isActive
          ? <ToggleRight className="size-7 text-[#4a5d3e]" />
          : <ToggleLeft className="size-7 text-muted-foreground" />}
      </button>

      {isActive && rule ? (
        <div className="flex flex-1 items-center gap-2">
          <Clock className="size-3.5 text-muted-foreground shrink-0" />
          <input type="time" defaultValue={rule.startTime}
            onBlur={(e) => onTimeChange(rule.id, e.target.value, rule.endTime)}
            className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-[#4a5d3e]" />
          <span className="text-muted-foreground text-sm">–</span>
          <input type="time" defaultValue={rule.endTime}
            onBlur={(e) => onTimeChange(rule.id, rule.startTime, e.target.value)}
            className="w-28 rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-[#4a5d3e]" />
        </div>
      ) : (
        <p className="flex-1 text-sm text-muted-foreground italic">Not available</p>
      )}
    </div>
  );
}

// ─── Main Client ──────────────────────────────────────────────────────────────
export function AvailabilityManager({ initialRules }: { initialRules: AvailabilityRule[] }) {
  const [rules, setRules] = useState(initialRules);
  const [showModal, setShowModal] = useState(false);

  const weeklyRules = rules.filter((r) => !r.specificDate);
  const overrideRules = rules.filter((r) => !!r.specificDate).sort(
    (a, b) => new Date(a.specificDate!).getTime() - new Date(b.specificDate!).getTime(),
  );

  async function handleToggle(dow: number, existing: AvailabilityRule | null): Promise<void> {
    if (existing) {
      const res = await updateAvailabilityRuleAction({ id: existing.id, isAvailable: !existing.isAvailable });
      if (!res.success) { toast.error(res.error); return; }
      setRules((prev) => prev.map((r) => r.id === existing.id ? { ...r, isAvailable: !r.isAvailable } : r));
    } else {
      const res = await createAvailabilityRuleAction({ dayOfWeek: dow, startTime: "09:00", endTime: "17:00", isAvailable: true });
      if (!res.success) { toast.error((res as any).error); return; }
      // Refresh rules (simple approach: reload)
      window.location.reload();
    }
  }

  async function handleTimeChange(ruleId: number, startTime: string, endTime: string) {
    const res = await updateAvailabilityRuleAction({ id: ruleId, startTime, endTime });
    if (!res.success) toast.error(res.error);
    else setRules((prev) => prev.map((r) => r.id === ruleId ? { ...r, startTime, endTime } : r));
  }

  async function handleAddOverride(input: Parameters<typeof createAvailabilityRuleAction>[0]) {
    const res = await createAvailabilityRuleAction(input);
    if (!res.success) { toast.error((res as any).error); return; }
    toast.success("Override added");
    window.location.reload();
  }

  async function handleDeleteOverride(ruleId: number) {
    const res = await deleteAvailabilityRuleAction(ruleId);
    if (!res.success) toast.error(res.error);
    else {
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      toast.success("Override removed");
    }
  }

  return (
    <>
      {showModal && (
        <AddOverrideModal onClose={() => setShowModal(false)} onAdd={handleAddOverride} />
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── Left: Weekly schedule ── */}
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-lg font-bold text-primary-deep">Weekly Schedule</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Toggle each day on/off and set your working hours. These repeat every week.
            </p>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 0].map((dow) => (
              <DayRow
                key={dow}
                dow={dow}
                rule={getRuleForDay(weeklyRules, dow)}
                onToggle={handleToggle}
                onTimeChange={handleTimeChange}
              />
            ))}
          </div>
        </section>

        {/* ── Right: Date-specific overrides ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-primary-deep">Date Overrides</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Override specific dates — add vacation blocks or extra working days.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#4a5d3e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3a4d2e] transition-colors"
            >
              <Plus className="size-3.5" /> Add Override
            </button>
          </div>

          {overrideRules.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Calendar className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No date overrides yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Add vacation blocks or one-off slots above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overrideRules.map((rule) => {
                const d = new Date(rule.specificDate!);
                const dateLabel = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
                return (
                  <div key={rule.id}
                    className={`flex items-center gap-4 rounded-2xl border p-4 ${rule.isAvailable ? "border-[rgba(74,93,62,0.25)] bg-[rgba(74,93,62,0.04)]" : "border-red-200 bg-red-50"}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-primary-deep">{dateLabel}</p>
                      {rule.title && <p className="text-xs text-muted-foreground">{rule.title}</p>}
                      {rule.isAvailable ? (
                        <p className="text-xs text-[#4a5d3e] font-medium">{rule.startTime} – {rule.endTime}</p>
                      ) : (
                        <p className="text-xs text-red-600 font-medium">Blocked</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteOverride(rule.id)}
                      className="shrink-0 rounded-xl p-1.5 hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
