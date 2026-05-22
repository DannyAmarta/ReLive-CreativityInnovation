"use client";

import Link from "next/link";
import { Toaster } from "sonner";
import { NotificationBell } from "@/components/trainer/NotificationBell";
import { UserProfileDropdown } from "@/components/shared/UserProfileDropdown";
import type { SessionUser } from "@/lib/session.server";
import type { NotificationRecord } from "@/lib/actions/notifications";

export default function TrainerShell({
  children,
  user,
  initialNotifications,
}: {
  children: React.ReactNode;
  user: SessionUser;
  initialNotifications: NotificationRecord[];
}) {
  return (
    <div className="min-h-dvh bg-gradient-surface text-foreground">
      <Toaster richColors position="top-right" />
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/trainer" className="flex items-center gap-2.5 shrink-0">
            <div className="relative size-8 rounded-lg bg-gradient-primary shadow-glow flex items-center justify-center">
              <div className="size-3 rounded-sm bg-highlight" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-sm tracking-tight">ReLive</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground -mt-0.5">Trainer Hub</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell initialNotifications={initialNotifications} />
            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-border" />
            {/* Profile Dropdown */}
            <UserProfileDropdown user={user} currentMode="trainer" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
