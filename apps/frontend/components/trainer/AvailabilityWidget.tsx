import Link from "next/link";
import { CalendarDays, Edit2 } from "lucide-react";
import type { AvailabilityRule } from "@/lib/actions/availability";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface AvailabilityWidgetProps {
  rules: AvailabilityRule[];
  isEditable?: boolean;
}

export function AvailabilityWidget({ rules, isEditable = false }: AvailabilityWidgetProps) {
  // Sort rules by day of week (0 = Sunday, 1 = Monday, etc.)
  const weeklyRules = Array.from({ length: 7 }, (_, i) => {
    const rule = rules.find((r) => r.dayOfWeek === i && !r.specificDate);
    return {
      dayIndex: i,
      dayName: DAYS[i],
      shortName: DAY_SHORT[i],
      rule,
      isActive: rule?.isAvailable ?? false,
    };
  });

  const hasAnyActive = weeklyRules.some(r => r.isActive);

  return (
    <div className="glass-card-elevated overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[rgba(88,120,74,0.12)]">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-[rgba(74,93,62,0.1)] flex items-center justify-center text-[#4a5d3e]">
            <CalendarDays className="size-4" />
          </div>
          <div>
            <h2 className="font-display font-bold text-primary-deep text-base leading-none">
              Weekly Schedule
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Trainer weekly working hours
            </p>
          </div>
        </div>
        {isEditable && (
          <Link
            href="/trainer/availability"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#55633e] hover:text-primary-deep transition-colors"
          >
            <Edit2 className="size-3" />
            Manage
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {!hasAnyActive ? (
          <div className="text-center py-6">
            <p className="text-xs text-muted-foreground italic">No weekly availability hours scheduled.</p>
            {isEditable && (
              <Link
                href="/trainer/availability"
                className="mt-3 inline-flex text-xs font-semibold text-[#4a5d3e] hover:underline"
              >
                Set your hours now →
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {weeklyRules.map((item) => (
              <div key={item.dayIndex} className="flex items-center justify-between text-xs py-1.5 border-b border-border/20 last:border-0">
                <span className="font-semibold text-primary-deep w-24">
                  {item.dayName}
                </span>
                {item.isActive && item.rule ? (
                  <span className="font-mono text-muted-foreground bg-[rgba(74,93,62,0.05)] px-2.5 py-1 rounded-lg border border-[rgba(74,93,62,0.1)]">
                    {item.rule.startTime} – {item.rule.endTime}
                  </span>
                ) : (
                  <span className="text-muted-foreground/60 italic">Not available</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
