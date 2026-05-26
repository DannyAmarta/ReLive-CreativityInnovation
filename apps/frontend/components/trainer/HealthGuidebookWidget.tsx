import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";

export function HealthGuidebookWidget() {
  return (
    <Link
      href="/cookbook"
      className="glass-card-elevated flex items-center justify-between px-5 py-4 hover:bg-[rgba(74,93,62,0.04)] transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-lg bg-[rgba(74,93,62,0.1)] flex items-center justify-center shrink-0">
          <BookOpen className="size-4 text-[#4a5d3e]" />
        </div>
        <div>
          <p className="font-display font-bold text-primary-deep text-sm leading-none">Health Guidebook</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Cookbook · Foods · Set Lab</p>
        </div>
      </div>
      <ArrowRight className="size-4 text-[#4a5d3e] group-hover:translate-x-1 transition-transform shrink-0" />
    </Link>
  );
}
