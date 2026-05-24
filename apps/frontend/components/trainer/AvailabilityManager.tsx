"use client";

import { useState, useTransition, useMemo, useEffect } from "react";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Calendar,
  Loader2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
function parseSafeDate(dateStr: string): Date {
  const cleanStr = dateStr.includes("T") ? dateStr.split("T")[0] : dateStr;
  const parts = cleanStr.split("-");
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date(dateStr);
}

function normalizeTime(timeStr: string): string {
  if (!timeStr) return "00:00";
  return timeStr.slice(0, 5);
}

const HOUR_OPTIONS = Array.from({ length: 25 }, (_, i) => {
  const h = String(i).padStart(2, "0");
  return `${h}:00`;
});

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

function getHourlySlots(startTime: string, endTime: string): { start: string; end: string }[] {
  const startM = toMinutes(startTime);
  const endM = toMinutes(endTime);
  const slots: { start: string; end: string }[] = [];
  for (let t = startM; t + 60 <= endM; t += 60) {
    slots.push({
      start: minutesToLabel(t),
      end: minutesToLabel(t + 60),
    });
  }
  return slots;
}

// ─── Slot Cell Component ──────────────────────────────────────────────────────
function SlotCell({
  slot,
  isBlocked,
  onClick,
}: {
  slot: { start: string; end: string };
  isBlocked: boolean;
  onClick: () => void;
}) {
  const [isPending, start] = useTransition();

  return (
    <button
      onClick={() => start(onClick)}
      disabled={isPending}
      className={`group relative flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
        isBlocked
          ? "bg-red-50/70 hover:bg-red-100/70 border-red-200 text-red-800"
          : "bg-[rgba(74,93,62,0.06)] hover:bg-[rgba(74,93,62,0.12)] border-[rgba(74,93,62,0.15)] text-[#2c3d22]"
      } disabled:opacity-50`}
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin text-muted-foreground my-1.5" />
      ) : (
        <>
          <span className="text-xs font-mono font-medium leading-none">
            {slot.start} – {slot.end}
          </span>
          <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider opacity-85">
            {isBlocked ? "Blocked" : "Available"}
          </span>
        </>
      )}
    </button>
  );
}

// ─── Add Override Modal ───────────────────────────────────────────────────────
function AddOverrideModal({
  onClose,
  onAdd,
  initialDate = "",
  weeklyRules,
  overrideGroups,
}: {
  onClose: () => void;
  onAdd: (
    input: {
      specificDate: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
      title?: string;
    },
    blockedSlots: { start: string; end: string }[],
    existingRuleIds?: number[]
  ) => Promise<void>;
  initialDate?: string;
  weeklyRules: AvailabilityRule[];
  overrideGroups: OverrideGroup[];
}) {
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [isAvailable, setIsAvailable] = useState(true);
  const [title, setTitle] = useState("");
  const [showPreview, setShowPreview] = useState(true);
  const [blockedSlots, setBlockedSlots] = useState<{ start: string; end: string }[]>([]);
  const [existingRuleIdsToDelete, setExistingRuleIdsToDelete] = useState<number[]>([]);
  const [isPending, start] = useTransition();

  // Load existing override settings or fall back to weekly defaults whenever the selected date changes
  useEffect(() => {
    if (!date) return;
    try {
      const d = parseSafeDate(date);
      if (isNaN(d.getTime())) return;

      const existingGroup = overrideGroups.find((g) => g.dateStr === date);
      if (existingGroup) {
        setIsAvailable(existingGroup.mainRule.isAvailable);
        setStartTime(normalizeTime(existingGroup.mainRule.startTime));
        setEndTime(normalizeTime(existingGroup.mainRule.endTime));
        setTitle(existingGroup.mainRule.title || "");
        
        // Map existing blocked rules to slots format
        const initialBlocked = existingGroup.blockedRules.map((br) => ({
          start: normalizeTime(br.startTime),
          end: normalizeTime(br.endTime),
        }));
        setBlockedSlots(initialBlocked);
        setExistingRuleIdsToDelete([
          existingGroup.mainRule.id,
          ...existingGroup.blockedRules.map((br) => br.id),
        ]);
      } else {
        // Fall back to weekly schedule default
        const dow = d.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const dayRules = weeklyRules.filter((r) => r.dayOfWeek === dow);
        const mainRule = dayRules.find((r) => r.isAvailable);
        const blockedRules = dayRules.filter((r) => !r.isAvailable);

        setTitle("");
        setExistingRuleIdsToDelete([]);

        if (mainRule) {
          setIsAvailable(true);
          setStartTime(normalizeTime(mainRule.startTime));
          setEndTime(normalizeTime(mainRule.endTime));
          
          // Map weekly blocked rules to slots format
          const initialBlocked = blockedRules.map((br) => ({
            start: normalizeTime(br.startTime),
            end: normalizeTime(br.endTime),
          }));
          setBlockedSlots(initialBlocked);
        } else {
          setIsAvailable(false);
          setStartTime("09:00");
          setEndTime("17:00");
          setBlockedSlots([]);
        }
      }
    } catch (e) {
      console.error("Failed to load date override settings:", e);
    }
  }, [date, weeklyRules, overrideGroups]);

  const slots = useMemo(() => getHourlySlots(startTime, endTime), [startTime, endTime]);

  // Sync blocked slots if the overall time range changes
  useEffect(() => {
    setBlockedSlots((prev) =>
      prev.filter((ps) =>
        slots.some((s) => s.start === ps.start && s.end === ps.end)
      )
    );
  }, [slots]);

  function submit() {
    if (!date) return toast.error("Please pick a date");
    start(async () => {
      await onAdd(
        { specificDate: date, startTime, endTime, isAvailable, title: title || undefined },
        isAvailable ? blockedSlots : [],
        existingRuleIdsToDelete
      );
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl p-6 space-y-5">
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
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Start</label>
                  <select
                    value={normalizeTime(startTime)}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#4a5d3e] font-mono"
                  >
                    {HOUR_OPTIONS.slice(0, 24).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">End</label>
                  <select
                    value={normalizeTime(endTime)}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-[#4a5d3e] font-mono"
                  >
                    {HOUR_OPTIONS.slice(1).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground py-1.5 border-b border-dashed border-border transition-colors"
                >
                  <span>Preview 1-Hour Slots (Click to block/unblock)</span>
                  {showPreview ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>

                {showPreview && (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-border rounded-xl bg-muted/20">
                    {slots.map((slot) => {
                      const isBlocked = blockedSlots.some(
                        (s) => s.start === slot.start && s.end === slot.end
                      );
                      return (
                        <button
                          key={`${slot.start}-${slot.end}`}
                          type="button"
                          onClick={() => {
                            if (isBlocked) {
                              setBlockedSlots((prev) =>
                                prev.filter(
                                  (s) => !(s.start === slot.start && s.end === slot.end)
                                )
                              );
                            } else {
                              setBlockedSlots((prev) => [...prev, slot]);
                            }
                          }}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                            isBlocked
                              ? "bg-red-50/70 hover:bg-red-100/70 border-red-200 text-red-800"
                              : "bg-[rgba(74,93,62,0.06)] hover:bg-[rgba(74,93,62,0.12)] border-[rgba(74,93,62,0.15)] text-[#2c3d22]"
                          }`}
                        >
                          <span className="text-xs font-mono font-medium leading-none">
                            {slot.start} – {slot.end}
                          </span>
                          <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider opacity-85">
                            {isBlocked ? "Blocked" : "Available"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
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
  mainRule,
  blockedRules,
  onToggle,
  onTimeChange,
  onToggleCell,
}: {
  dow: number;
  mainRule: AvailabilityRule | null;
  blockedRules: AvailabilityRule[];
  onToggle: (dow: number, currentRule: AvailabilityRule | null) => Promise<void>;
  onTimeChange: (ruleId: number, startTime: string, endTime: string) => Promise<void>;
  onToggleCell: (
    slot: { start: string; end: string },
    isBlocked: boolean,
    blockedRuleId?: number,
    dow?: number,
    specificDate?: string
  ) => Promise<void>;
}) {
  const [isPending, start] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = mainRule?.isAvailable ?? false;

  return (
    <div className={`rounded-2xl border p-4 transition-all ${isActive ? "border-[rgba(74,93,62,0.25)] bg-[rgba(74,93,62,0.04)]" : "border-border bg-muted/20"}`}>
      <div className="flex items-center gap-4">
        <div className="w-12 shrink-0 text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{DAY_SHORT[dow]}</p>
          <p className="text-xs text-muted-foreground">{DAYS[dow].slice(0, 3)}</p>
        </div>

        <button
          onClick={() => start(() => onToggle(dow, mainRule))}
          disabled={isPending}
          className="shrink-0 transition-opacity disabled:opacity-50"
        >
          {isActive
            ? <ToggleRight className="size-7 text-[#4a5d3e]" />
            : <ToggleLeft className="size-7 text-muted-foreground" />}
        </button>

        {isActive && mainRule ? (
          <div className="flex flex-1 items-center gap-2">
            <Clock className="size-3.5 text-muted-foreground shrink-0" />
            <select
              value={normalizeTime(mainRule.startTime)}
              onChange={(e) => onTimeChange(mainRule.id, e.target.value, normalizeTime(mainRule.endTime))}
              className="rounded-lg border border-border bg-background px-2.5 py-1 text-sm outline-none focus:border-[#4a5d3e] font-mono"
            >
              {HOUR_OPTIONS.slice(0, 24).map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            <span className="text-muted-foreground text-sm">–</span>
            <select
              value={normalizeTime(mainRule.endTime)}
              onChange={(e) => onTimeChange(mainRule.id, normalizeTime(mainRule.startTime), e.target.value)}
              className="rounded-lg border border-border bg-background px-2.5 py-1 text-sm outline-none focus:border-[#4a5d3e] font-mono"
            >
              {HOUR_OPTIONS.slice(1).map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ) : (
          <p className="flex-1 text-sm text-muted-foreground italic">Not available</p>
        )}

        {isActive && mainRule && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#4a5d3e] hover:bg-[#4a5d3e]/10 transition-colors border border-[rgba(74,93,62,0.2)]"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="size-3.5" />
                <span className="hidden sm:inline">Hide Slots</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" />
                <span className="hidden sm:inline">Show Slots</span>
              </>
            )}
          </button>
        )}
      </div>

      {isActive && mainRule && isExpanded && (
        <div className="mt-4 pt-4 border-t border-dashed border-border/80">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Hourly Slot Control</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {getHourlySlots(mainRule.startTime, mainRule.endTime).map((slot) => {
              const blockedRule = blockedRules.find(br => {
                const brStart = toMinutes(br.startTime);
                const brEnd = toMinutes(br.endTime);
                const slotStart = toMinutes(slot.start);
                const slotEnd = toMinutes(slot.end);
                return slotStart >= brStart && slotEnd <= brEnd;
              });
              const isBlocked = !!blockedRule;

              return (
                <SlotCell
                  key={`${slot.start}-${slot.end}`}
                  slot={slot}
                  isBlocked={isBlocked}
                  onClick={() => onToggleCell(slot, isBlocked, blockedRule?.id, dow, undefined)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Override Row (date overrides) ────────────────────────────────────────────
type OverrideGroup = {
  dateStr: string;
  mainRule: AvailabilityRule;
  blockedRules: AvailabilityRule[];
};

function OverrideRow({
  group,
  onDelete,
  onToggleCell,
}: {
  group: OverrideGroup;
  onDelete: (ids: number[]) => Promise<void>;
  onToggleCell: (
    slot: { start: string; end: string },
    isBlocked: boolean,
    blockedRuleId?: number,
    dow?: number,
    specificDate?: string
  ) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPending, start] = useTransition();

  const d = parseSafeDate(group.dateStr);
  const dateLabel = d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isActive = group.mainRule.isAvailable;
  const allIds = [group.mainRule.id, ...group.blockedRules.map((r) => r.id)];

  return (
    <div
      className={`rounded-2xl border p-4 transition-all ${
        isActive
          ? "border-[rgba(74,93,62,0.25)] bg-[rgba(74,93,62,0.04)]"
          : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary-deep">{dateLabel}</p>
          {group.mainRule.title && (
            <p className="text-xs text-muted-foreground">{group.mainRule.title}</p>
          )}
          {isActive ? (
            <p className="text-xs text-[#4a5d3e] font-medium">
              {normalizeTime(group.mainRule.startTime)} – {normalizeTime(group.mainRule.endTime)}
            </p>
          ) : (
            <p className="text-xs text-red-600 font-medium">Blocked</p>
          )}
        </div>

        {isActive && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#4a5d3e] hover:bg-[#4a5d3e]/10 transition-colors border border-[rgba(74,93,62,0.2)]"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="size-3.5" />
                <span className="hidden sm:inline">Hide Slots</span>
              </>
            ) : (
              <>
                <ChevronDown className="size-3.5" />
                <span className="hidden sm:inline">Show Slots</span>
              </>
            )}
          </button>
        )}

        <button
          onClick={() => start(() => onDelete(allIds))}
          disabled={isPending}
          className="shrink-0 rounded-xl p-1.5 hover:bg-red-100 text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
      </div>

      {isActive && isExpanded && (
        <div className="mt-4 pt-4 border-t border-dashed border-border/80">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Hourly Slot Control</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {getHourlySlots(group.mainRule.startTime, group.mainRule.endTime).map((slot) => {
              const blockedRule = group.blockedRules.find(br => {
                const brStart = toMinutes(br.startTime);
                const brEnd = toMinutes(br.endTime);
                const slotStart = toMinutes(slot.start);
                const slotEnd = toMinutes(slot.end);
                return slotStart >= brStart && slotEnd <= brEnd;
              });
              const isBlocked = !!blockedRule;

              return (
                <SlotCell
                  key={`${slot.start}-${slot.end}`}
                  slot={slot}
                  isBlocked={isBlocked}
                  onClick={() => onToggleCell(slot, isBlocked, blockedRule?.id, undefined, group.dateStr)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Client Component ───────────────────────────────────────────────────
export function AvailabilityManager({ initialRules }: { initialRules: AvailabilityRule[] }) {
  const [rules, setRules] = useState(initialRules);
  const [showModal, setShowModal] = useState(false);
  const [preselectedDate, setPreselectedDate] = useState("");
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

  const weeklyRules = rules.filter((r) => !r.specificDate);
  const overrideRules = rules.filter((r) => !!r.specificDate);

  const overrideGroups = useMemo(() => {
    const groupsMap = new Map<string, AvailabilityRule[]>();
    for (const r of overrideRules) {
      if (!r.specificDate) continue;
      const dateStr = r.specificDate.slice(0, 10);
      if (!groupsMap.has(dateStr)) {
        groupsMap.set(dateStr, []);
      }
      groupsMap.get(dateStr)!.push(r);
    }

    const groups: OverrideGroup[] = [];
    groupsMap.forEach((rulesList, dateStr) => {
      const mainRule = rulesList.find((r) => r.isAvailable) || rulesList[0];
      const blockedRules = rulesList.filter((r) => r.id !== mainRule.id && !r.isAvailable);
      groups.push({
        dateStr,
        mainRule,
        blockedRules,
      });
    });

    return groups.sort(
      (a, b) => parseSafeDate(a.dateStr).getTime() - parseSafeDate(b.dateStr).getTime()
    );
  }, [overrideRules]);

  const calendarDays = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(currentYear, currentMonth, d));
    }
    return days;
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  };

  async function handleToggle(dow: number, existing: AvailabilityRule | null): Promise<void> {
    if (existing) {
      // Toggle OFF: delete the main rule AND any blocked rules for this day of week
      const toDelete = [
        existing.id,
        ...rules
          .filter((r) => r.dayOfWeek === dow && !r.isAvailable && !r.specificDate)
          .map((r) => r.id),
      ];
      
      const deletePromises = toDelete.map((id) => deleteAvailabilityRuleAction(id));
      const results = await Promise.all(deletePromises);
      const failed = results.find((res) => !res.success);
      
      if (failed) {
        toast.error(failed.error);
        return;
      }
      
      setRules((prev) => prev.filter((r) => r.dayOfWeek !== dow || !!r.specificDate));
      toast.success(`${DAYS[dow]} schedule disabled`);
    } else {
      // Toggle ON: create a new rule with isAvailable: true
      const res = await createAvailabilityRuleAction({ dayOfWeek: dow, startTime: "09:00", endTime: "17:00", isAvailable: true });
      if (!res.success) { toast.error((res as any).error); return; }
      if (res.rule) {
        setRules((prev) => [...prev, res.rule]);
        toast.success(`${DAYS[dow]} schedule enabled`);
      } else {
        window.location.reload();
      }
    }
  }

  async function handleTimeChange(ruleId: number, startTime: string, endTime: string) {
    const res = await updateAvailabilityRuleAction({ id: ruleId, startTime, endTime });
    if (!res.success) toast.error(res.error);
    else setRules((prev) => prev.map((r) => r.id === ruleId ? { ...r, startTime, endTime } : r));
  }

  async function handleAddOverride(
    input: Parameters<typeof createAvailabilityRuleAction>[0],
    blockedSlots: { start: string; end: string }[],
    existingRuleIdsToDelete?: number[]
  ) {
    if (existingRuleIdsToDelete && existingRuleIdsToDelete.length > 0) {
      const deletePromises = existingRuleIdsToDelete.map((id) =>
        deleteAvailabilityRuleAction(id)
      );
      await Promise.all(deletePromises);
    }

    const res = await createAvailabilityRuleAction(input);
    if (!res.success) {
      toast.error((res as any).error);
      return;
    }

    const addedRules: AvailabilityRule[] = [];
    if (res.rule) {
      addedRules.push(res.rule);
    }

    if (blockedSlots.length > 0 && input.specificDate) {
      const promises = blockedSlots.map((slot) =>
        createAvailabilityRuleAction({
          specificDate: input.specificDate,
          startTime: slot.start,
          endTime: slot.end,
          isAvailable: false,
        })
      );
      const results = await Promise.all(promises);
      for (const r of results) {
        if (r.success && r.rule) {
          addedRules.push(r.rule);
        }
      }
    }

    toast.success(
      existingRuleIdsToDelete && existingRuleIdsToDelete.length > 0
        ? "Override updated"
        : "Override added"
    );

    setRules((prev) => {
      let filtered = prev;
      if (existingRuleIdsToDelete && existingRuleIdsToDelete.length > 0) {
        filtered = prev.filter((r) => !existingRuleIdsToDelete.includes(r.id));
      }
      return [...filtered, ...addedRules];
    });
  }

  async function handleDeleteOverrideGroup(ids: number[]) {
    const promises = ids.map((id) => deleteAvailabilityRuleAction(id));
    const results = await Promise.all(promises);
    const failed = results.find((res) => !res.success);
    if (failed) {
      toast.error(failed.error);
    } else {
      setRules((prev) => prev.filter((r) => !ids.includes(r.id)));
      toast.success("Override removed");
    }
  }

  async function handleToggleCell(
    slot: { start: string; end: string },
    isBlocked: boolean,
    blockedRuleId?: number,
    dow?: number,
    specificDate?: string
  ) {
    if (isBlocked && blockedRuleId) {
      const res = await deleteAvailabilityRuleAction(blockedRuleId);
      if (!res.success) {
        toast.error(res.error);
      } else {
        setRules((prev) => prev.filter((r) => r.id !== blockedRuleId));
        toast.success("Slot is now available");
      }
    } else {
      const res = await createAvailabilityRuleAction({
        dayOfWeek: dow,
        specificDate: specificDate ? specificDate.slice(0, 10) : undefined,
        startTime: slot.start,
        endTime: slot.end,
        isAvailable: false,
      });
      if (!res.success) {
        toast.error((res as any).error);
      } else {
        if (res.rule) {
          setRules((prev) => [...prev, res.rule]);
          toast.success("Slot blocked");
        } else {
          window.location.reload();
        }
      }
    }
  }

  function getWeeklyRulesForDay(dow: number) {
    const dayRules = weeklyRules.filter((r) => r.dayOfWeek === dow);
    const mainRule = dayRules.find((r) => r.isAvailable) ?? null;
    const blockedRules = dayRules.filter((r) => !r.isAvailable);
    return { mainRule, blockedRules };
  }

  return (
    <>
      {showModal && (
        <AddOverrideModal
          onClose={() => {
            setShowModal(false);
            setPreselectedDate("");
          }}
          onAdd={handleAddOverride}
          initialDate={preselectedDate}
          weeklyRules={weeklyRules}
          overrideGroups={overrideGroups}
        />
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-lg font-bold text-primary-deep">Weekly Schedule</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Toggle each day on/off and set your working hours. These repeat every week.
            </p>
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 0].map((dow) => {
              const { mainRule, blockedRules } = getWeeklyRulesForDay(dow);
              return (
                <DayRow
                  key={dow}
                  dow={dow}
                  mainRule={mainRule}
                  blockedRules={blockedRules}
                  onToggle={handleToggle}
                  onTimeChange={handleTimeChange}
                  onToggleCell={handleToggleCell}
                />
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-primary-deep">Date Overrides</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Override specific dates — add vacation blocks or one-off slots above.
              </p>
            </div>
            <button
              onClick={() => {
                setPreselectedDate("");
                setShowModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#4a5d3e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#3a4d2e] transition-colors"
            >
              <Plus className="size-3.5" /> Add Override
            </button>
          </div>

          {overrideGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <Calendar className="size-8 mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No date overrides yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Add vacation blocks or one-off slots above.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overrideGroups.map((group) => (
                <OverrideRow
                  key={group.dateStr}
                  group={group}
                  onDelete={handleDeleteOverrideGroup}
                  onToggleCell={handleToggleCell}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Interactive Calendar Override View */}
      <section className="mt-12 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-primary-deep">Interactive Calendar Overrides</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Click any date in the calendar below to instantly customize overrides for that day.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl border border-border hover:bg-muted/50 transition-colors"
            >
              <ChevronLeft className="size-4 text-muted-foreground hover:text-foreground" />
            </button>
            <span className="text-sm font-semibold text-primary-deep min-w-[140px] text-center font-display">
              {new Date(currentYear, currentMonth).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-xl border border-border hover:bg-muted/50 transition-colors"
            >
              <ChevronRight className="size-4 text-muted-foreground hover:text-foreground" />
            </button>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card/25 p-4 shadow-sm backdrop-blur-sm">
          {/* Calendar grid headers */}
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {day}
              </span>
            ))}
          </div>

          {/* Calendar grid body */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, idx) => {
              if (!day) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="min-h-[85px] rounded-2xl bg-muted/5 border border-transparent"
                  />
                );
              }

              const dString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
              const group = overrideGroups.find((g) => g.dateStr === dString);
              
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const compareDay = new Date(day.getTime());
              compareDay.setHours(0, 0, 0, 0);

              const isToday = today.toDateString() === day.toDateString();
              const isPast = compareDay.getTime() < today.getTime();

              // Fallback check to weekly schedule default
              const dow = day.getDay();
              const dayRules = weeklyRules.filter((r) => r.dayOfWeek === dow);
              const mainWeeklyRule = dayRules.find((r) => r.isAvailable);
              const weeklyBlockedRules = dayRules.filter((r) => {
                if (r.isAvailable) return false;
                if (!mainWeeklyRule) return false;
                const startM = toMinutes(mainWeeklyRule.startTime);
                const endM = toMinutes(mainWeeklyRule.endTime);
                const brStart = toMinutes(r.startTime);
                const brEnd = toMinutes(r.endTime);
                return brStart >= startM && brEnd <= endM;
              });

              return (
                <button
                  key={dString}
                  disabled={isPast}
                  onClick={() => {
                    setPreselectedDate(dString);
                    setShowModal(true);
                  }}
                  className={`min-h-[85px] rounded-2xl border p-3.5 text-left transition-all flex flex-col justify-between ${
                    isPast
                      ? "border-transparent bg-muted/5 opacity-30 cursor-default"
                      : isToday
                      ? "border-[#4a5d3e] bg-[#4a5d3e]/5 ring-1 ring-[#4a5d3e] cursor-pointer hover:scale-[1.01] active:scale-99"
                      : "border-border bg-card/45 hover:bg-muted/30 hover:border-[#4a5d3e]/30 cursor-pointer hover:scale-[1.01] active:scale-99"
                  }`}
                >
                  <span className={`text-xs font-semibold ${isToday ? "text-[#4a5d3e]" : isPast ? "text-muted-foreground/50" : "text-foreground"}`}>
                    {day.getDate()}
                  </span>
                  
                  {!isPast && (
                    <>
                      {group ? (
                        <div className="mt-1 w-full space-y-1">
                          {group.mainRule.isAvailable ? (
                            <div className="rounded-lg bg-green-50/90 border border-green-200/50 px-1.5 py-0.5 text-[9px] font-semibold text-green-800 text-center leading-tight truncate">
                              Available
                            </div>
                          ) : (
                            <div className="rounded-lg bg-red-50/90 border border-red-200/50 px-1.5 py-0.5 text-[9px] font-semibold text-red-800 text-center leading-tight truncate">
                              Blocked
                            </div>
                          )}
                          {group.blockedRules.length > 0 && (
                            <div className="text-[8px] text-muted-foreground text-center font-medium leading-none mt-0.5">
                              {group.blockedRules.length} slot{group.blockedRules.length > 1 ? "s" : ""} blocked
                            </div>
                          )}
                        </div>
                      ) : mainWeeklyRule ? (
                        <div className="mt-1 w-full space-y-1">
                          <div className="rounded-lg bg-[rgba(74,93,62,0.03)] border border-[rgba(74,93,62,0.1)] px-1.5 py-0.5 text-[9px] font-semibold text-[#4a5d3e]/70 text-center leading-tight truncate">
                            Available
                          </div>
                          {weeklyBlockedRules.length > 0 && (
                            <div className="text-[8px] text-muted-foreground/60 text-center font-medium leading-none mt-0.5">
                              {weeklyBlockedRules.length} slot{weeklyBlockedRules.length > 1 ? "s" : ""} blocked (W)
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="mt-1 w-full">
                          <div className="rounded-lg bg-gray-50/50 border border-gray-200/40 px-1.5 py-0.5 text-[9px] font-medium text-gray-400 text-center leading-tight truncate">
                            Blocked
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
