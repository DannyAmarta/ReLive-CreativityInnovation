import Link from "next/link";
import { Dumbbell, ArrowRight } from "lucide-react";

export function SetCalculatorWidget() {
  return (
    <div className="glass-card-elevated overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(88,120,74,0.1)]">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-[rgba(74,93,62,0.1)] flex items-center justify-center">
            <Dumbbell className="size-3.5 text-[#4a5d3e]" />
          </div>
          <h2 className="font-display font-bold text-primary-deep text-base">
            Set Lab Calculator
          </h2>
        </div>
        <Link
          href="/set"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#55633e] hover:text-primary-deep transition-colors"
        >
          Open Set Lab
          <ArrowRight className="size-3" />
        </Link>
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col gap-4">
        <p className="text-xs leading-relaxed text-[#67715f]">
          Estimate client training maxes, calculate 1-Rep Max (1RM) using Brzycki, and design guided routines based on target sets/reps and RIR/RPE.
        </p>

        <Link
          href="/set"
          className="flex items-center justify-center gap-2 rounded-full bg-[#4a5d3e] px-4 py-2.5 text-xs font-bold text-[#f8f6ef] shadow-[0_8px_16px_rgba(74,93,62,0.15)] hover:bg-[#3d4f32] transition-all hover:-translate-y-0.5"
        >
          Calculate & Plan
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
