"use client";

import { Bell, Check, Inbox } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { BACKEND_URL } from "@/lib/constants";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { NotificationRecord } from "@/lib/actions/notifications";
import {
  markAllNotificationsAsReadAction,
  markNotificationAsReadAction,
} from "@/lib/actions/notifications";

function fmtRelative(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationBell({
  initialNotifications,
  accessToken,
}: {
  initialNotifications: NotificationRecord[];
  accessToken?: string;
}) {
  const [items, setItems] = useState(initialNotifications);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!accessToken) return;

    const socket: Socket = io(BACKEND_URL, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });

    socket.on("new_notification", (notification: any) => {
      const newRecord: NotificationRecord = {
        id: notification.id,
        title: notification.title,
        body: notification.body,
        link: notification.link,
        read: false,
        createdAt: notification.createdAt || new Date().toISOString(),
      };
      
      setItems((prev) => [newRecord, ...prev]);
      toast.info(newRecord.title, { description: newRecord.body });
    });

    return () => {
      socket.off("new_notification");
      socket.disconnect();
    };
  }, [accessToken]);

  const unread = items.filter((n) => !n.read).length;

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsAsReadAction();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    });
  }

  function handleClickNotification(id: number) {
    // Optimistically mark as read locally
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    if (id < 0) return; // Skip API call for client-side dynamic notifications
    startTransition(async () => {
      await markNotificationAsReadAction(id);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
          className="relative size-9 rounded-lg border border-border bg-card hover:bg-muted transition-colors flex items-center justify-center"
        >
          <Bell className="size-4 text-foreground" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 size-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-semibold flex items-center justify-center animate-pulse">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              disabled={isPending}
              onClick={handleMarkAllRead}
            >
              <Check className="size-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
              <Inbox className="size-8 opacity-40" />
              <p className="text-xs">You're all caught up!</p>
            </div>
          ) : (
            items.map((n) => {
              const content = (
                <>
                  <div
                    className={cn(
                      "mt-1.5 size-2 rounded-full shrink-0",
                      !n.read ? "bg-primary" : "bg-muted-foreground/30",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {fmtRelative(n.createdAt)}
                    </p>
                  </div>
                </>
              );

              const rowClass = cn(
                "flex gap-3 px-4 py-3 border-b border-border/60 last:border-0 transition-colors",
                !n.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/60",
              );

              if (n.link) {
                return (
                  <Link
                    key={n.id}
                    href={n.link}
                    className={rowClass}
                    onClick={() => handleClickNotification(n.id)}
                  >
                    {content}
                  </Link>
                );
              }

              return (
                <div
                  key={n.id}
                  className={rowClass}
                  onClick={() => handleClickNotification(n.id)}
                  role="button"
                  tabIndex={0}
                >
                  {content}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-4 py-2.5 text-center">
            <p className="text-[11px] text-muted-foreground">
              Showing last {items.length} notification{items.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
