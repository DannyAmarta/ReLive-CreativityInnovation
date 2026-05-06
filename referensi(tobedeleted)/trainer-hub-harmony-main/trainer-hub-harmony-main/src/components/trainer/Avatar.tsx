import { cn } from "@/lib/utils";

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-mint text-highlight-foreground font-semibold text-xs shrink-0 ring-1 ring-accent/20",
        className ?? "size-9"
      )}
    >
      {initials}
    </div>
  );
}
