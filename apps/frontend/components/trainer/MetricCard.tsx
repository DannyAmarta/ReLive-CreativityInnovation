import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
}

export function MetricCard({ label, value, sub, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <div className={cn("metric-card group", className)}>
      <div className="relative flex items-start justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7662]">{label}</p>
        {Icon && (
          <div className="size-8 rounded-lg border border-[rgba(74,93,62,0.12)] bg-[rgba(74,93,62,0.08)] flex items-center justify-center text-[#4a5d3e]">
            <Icon className="size-4" />
          </div>
        )}
      </div>
      <p className="relative text-3xl font-semibold tracking-tight tabular-nums font-mono text-primary-deep">{value}</p>
      {sub && <p className="relative text-xs text-[#67715f] mt-1.5">{sub}</p>}
      {trend && (
        <p className="relative mt-2 inline-flex items-center gap-1 text-xs font-medium text-[#7f5a30]">
          <span className="size-1.5 rounded-full bg-[#c77a5a] animate-pulse-soft" />
          {trend}
        </p>
      )}
    </div>
  );
}
