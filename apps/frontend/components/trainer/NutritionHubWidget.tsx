import Link from "next/link";
import { BookOpen, Utensils, ArrowRight } from "lucide-react";

export function NutritionHubWidget() {
  return (
    <div className="glass-card-elevated overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(88,120,74,0.1)]">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-[rgba(244,63,94,0.1)] flex items-center justify-center">
            <Utensils className="size-3.5 text-rose-500" />
          </div>
          <h2 className="font-display font-bold text-primary-deep text-base">
            Nutrition & Kitchen
          </h2>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex flex-col gap-4">
        {/* Row 1: Search Cookbook */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-[rgba(74,93,62,0.03)] border border-[rgba(88,120,74,0.06)] hover:bg-[rgba(74,93,62,0.06)] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="size-3.5 text-[#4a5d3e]" />
              <span className="text-xs font-bold text-primary-deep">Search Cookbook</span>
            </div>
            <Link
              href="/cookbook"
              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#4a5d3e] hover:text-[#3d4f32] transition-colors"
            >
              Browse
              <ArrowRight className="size-2.5" />
            </Link>
          </div>
          <p className="text-[11px] leading-relaxed text-[#67715f]">
            Find healthy recipes, review ingredients, and share culinary guides with clients.
          </p>
        </div>

        {/* Row 2: Food Calculator */}
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-[rgba(244,63,94,0.02)] border border-[rgba(244,63,94,0.06)] hover:bg-[rgba(244,63,94,0.04)] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="size-3.5 text-rose-500" />
              <span className="text-xs font-bold text-rose-700">Food Calculator</span>
            </div>
            <Link
              href="/foods"
              className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              Calculate
              <ArrowRight className="size-2.5" />
            </Link>
          </div>
          <p className="text-[11px] leading-relaxed text-[#67715f]">
            Track calorie budgets, compute macro goals, and design custom meal plans.
          </p>
        </div>
      </div>
    </div>
  );
}
