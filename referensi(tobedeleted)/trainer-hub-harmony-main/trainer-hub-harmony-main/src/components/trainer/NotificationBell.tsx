import { Bell, Check } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { notifications as initial, fmtRelative } from "@/lib/mock-data";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [items, setItems] = useState(initial);
  const unread = items.filter((n) => !n.read).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Notifications"
          className="relative size-9 rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center"
        >
          <Bell className="size-4 text-foreground" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">Notifications</p>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setItems((xs) => xs.map((n) => ({ ...n, read: true })))}
          >
            <Check className="size-3 mr-1" /> Mark all read
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.map((n) => (
            <Link
              key={n.id}
              to={n.link}
              className={cn(
                "flex gap-3 px-4 py-3 hover:bg-muted/60 border-b border-border/60 last:border-0 transition-colors",
                !n.read && "bg-accent/5"
              )}
            >
              <div className={cn("mt-1.5 size-2 rounded-full shrink-0", !n.read ? "bg-accent" : "bg-muted-foreground/30")} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{n.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{fmtRelative(n.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
