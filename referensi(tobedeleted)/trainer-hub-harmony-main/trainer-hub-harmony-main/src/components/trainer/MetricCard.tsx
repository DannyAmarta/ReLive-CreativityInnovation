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
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
        {Icon && (
          <div className="size-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
            <Icon className="size-4" />
          </div>
        )}
      </div>
      <p className="relative text-3xl font-semibold tracking-tight tabular-nums font-mono">{value}</p>
      {sub && <p className="relative text-xs text-muted-foreground mt-1.5">{sub}</p>}
      {trend && (
        <p className="relative text-xs font-medium text-accent mt-2 inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-accent animate-pulse-soft" />
          {trend}
        </p>
      )}
    </div>
  );
}
