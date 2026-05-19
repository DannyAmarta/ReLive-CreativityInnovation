import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning-foreground border-warning/30 [&>span]:bg-warning",
  ACTIVE: "bg-accent/10 text-primary border-accent/30 [&>span]:bg-accent",
  COMPLETED: "bg-muted text-muted-foreground border-border [&>span]:bg-muted-foreground",
  CANCELLED: "bg-muted text-muted-foreground border-border [&>span]:bg-muted-foreground/60",
  DISPUTED: "bg-destructive/10 text-destructive border-destructive/30 [&>span]:bg-destructive",
  CRYPTO: "bg-primary/10 text-primary border-primary/20 [&>span]:bg-primary",
  FIAT: "bg-accent/10 text-accent-foreground border-accent/30 [&>span]:bg-accent",
  CREDIT: "bg-success/10 text-success border-success/20 [&>span]:bg-success",
  WITHDRAWAL: "bg-muted text-foreground border-border [&>span]:bg-foreground/60",
  FAILED: "bg-destructive/10 text-destructive border-destructive/30 [&>span]:bg-destructive",
};

export function StatusBadge({
  status,
  className,
  dot = true,
}: {
  status: string;
  className?: string;
  dot?: boolean;
}) {
  const style = styles[status] ?? styles.COMPLETED;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium tracking-wide",
        style,
        className
      )}
    >
      {dot && <span className="size-1.5 rounded-full" />}
      {status}
    </span>
  );
}
