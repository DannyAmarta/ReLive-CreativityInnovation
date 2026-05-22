import Link from "next/link";
import { Zap, ArrowRight, PlusCircle } from "lucide-react";
import { formatIDR, formatUSDC } from "@/lib/format";
import { lamportsToTokenUnits } from "@/lib/marketplace";
import type { TrainerServiceRecord } from "@/lib/marketplace";

const MAX_SHOWN = 4;

interface ActiveServicesStripProps {
  services: TrainerServiceRecord[];
}

export function ActiveServicesStrip({ services }: ActiveServicesStripProps) {
  const active = services.filter((s) => s.isActive);
  const shown = active.slice(0, MAX_SHOWN);
  const extra = active.length - MAX_SHOWN;

  return (
    <div className="glass-card-elevated overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(88,120,74,0.1)]">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-[rgba(74,93,62,0.1)] flex items-center justify-center">
            <Zap className="size-3.5 text-[#4a5d3e]" />
          </div>
          <h2 className="font-display font-bold text-primary-deep text-base">
            Your Services
          </h2>
          {active.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(74,93,62,0.1)] px-2 py-0.5">
              <span className="size-1.5 rounded-full bg-[#58784a] animate-pulse-soft" />
              <span className="text-[10px] font-semibold text-[#4a5d3e]">{active.length} active</span>
            </span>
          )}
        </div>
        <Link
          href="/trainer/services"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#55633e] hover:text-primary-deep transition-colors"
        >
          Manage
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Items */}
      {shown.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-8 px-5 text-center">
          <p className="text-sm text-muted-foreground">No active services yet —</p>
          <Link
            href="/trainer/services"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#55633e] hover:underline"
          >
            <PlusCircle className="size-3.5" />
            Add one
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-[rgba(88,120,74,0.07)]">
          {shown.map((service) => (
            <li
              key={service.id}
              className="flex items-center gap-3 px-5 py-3.5 hover:bg-[rgba(74,93,62,0.03)] transition-colors"
            >
              {/* Active indicator */}
              <span
                className={`size-2 rounded-full shrink-0 ${
                  service.isActive
                    ? "bg-[#58784a] animate-pulse-soft"
                    : "bg-muted-foreground/30"
                }`}
              />

              {/* Name */}
              <p className="text-sm font-medium text-primary-deep flex-1 truncate">
                {service.title}
              </p>

              {/* Prices */}
              <div className="flex items-center gap-2 shrink-0">
                {service.priceInIdr ? (
                  <span className="rounded-full bg-[rgba(74,93,62,0.08)] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#55633e]">
                    {formatIDR(service.priceInIdr)}
                  </span>
                ) : null}
                {service.priceInLamports ? (
                  <span className="rounded-full bg-[rgba(199,122,90,0.08)] px-2.5 py-1 font-mono text-[11px] font-semibold text-terracotta-600">
                    {formatUSDC(lamportsToTokenUnits(service.priceInLamports))}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
          {extra > 0 && (
            <li className="px-5 py-3">
              <Link
                href="/trainer/services"
                className="text-xs text-muted-foreground hover:text-primary-deep transition-colors"
              >
                + {extra} more service{extra !== 1 ? "s" : ""}
              </Link>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
