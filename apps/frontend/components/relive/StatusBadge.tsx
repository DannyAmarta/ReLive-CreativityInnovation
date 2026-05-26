import { cn } from "@/lib/utils";

type Status = string;

const styles: Record<string, string> = {
  PENDING: "bg-amber-500/15 text-amber-700",
  ACTIVE: "bg-emerald-500/15 text-emerald-700",
  COMPLETED: "bg-emerald-900/20 text-emerald-950 font-bold",
  CANCELLED: "bg-destructive/10 text-destructive",
  DISPUTED: "bg-warning/15 text-warning-foreground",
  FAILED: "bg-destructive/10 text-destructive",
};

const dotColor: Record<string, string> = {
  PENDING: "bg-amber-500",
  ACTIVE: "bg-emerald-500",
  COMPLETED: "bg-emerald-900",
  CANCELLED: "bg-destructive",
  DISPUTED: "bg-warning",
  FAILED: "bg-destructive",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        styles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          dotColor[status] ?? "bg-muted-foreground",
        )}
      />
      {status}
    </span>
  );
}
