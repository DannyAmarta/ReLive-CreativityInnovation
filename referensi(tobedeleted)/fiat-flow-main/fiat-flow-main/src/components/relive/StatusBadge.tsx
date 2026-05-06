import { cn } from "@/lib/utils";

type Status = string;

const styles: Record<string, string> = {
  PENDING: "bg-warning/15 text-warning-foreground",
  ACTIVE: "bg-primary/10 text-primary",
  COMPLETED: "bg-primary-deep/10 text-primary-deep",
  CANCELLED: "bg-destructive/10 text-destructive",
  DISPUTED: "bg-warning/15 text-warning-foreground",
  FAILED: "bg-destructive/10 text-destructive",
};

const dotColor: Record<string, string> = {
  PENDING: "bg-warning",
  ACTIVE: "bg-primary",
  COMPLETED: "bg-primary-deep",
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