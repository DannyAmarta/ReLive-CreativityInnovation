"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Logo from "@/public/assets/wallpaper/logo.png";
import { Toaster } from "sonner";
import { NotificationBell } from "@/components/trainer/NotificationBell";
import { UserProfileDropdown } from "@/components/shared/UserProfileDropdown";
import type { SessionUser } from "@/lib/session.server";
import type { NotificationRecord } from "@/lib/actions/notifications";

export default function TrainerShell({
  children,
  user,
  accessToken,
  initialNotifications,
}: {
  children: React.ReactNode;
  user: SessionUser;
  accessToken?: string;
  initialNotifications: NotificationRecord[];
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-gradient-surface text-foreground">
      <Toaster richColors position="top-right" />
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/trainer" className="flex items-center gap-2.5 shrink-0">
            <Image src={Logo} alt="ReLive Logo" className="size-8 rounded-lg object-cover" />
            <div className="leading-tight">
              <p className="font-semibold text-sm tracking-tight">ReLive</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground -mt-0.5">Trainer Hub</p>
            </div>
          </Link>

          {/* Navigation Topbar */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto mx-4">
            {[
              { label: "Services", href: "/trainer/services" },
              { label: "Calendar", href: "/trainer/calendar" },
              { label: "Bookings", href: "/trainer/bookings" },
              { label: "Messages", href: "/trainer/messages" },
              { label: "Wallet", href: "/trainer/wallet" },
              { label: "Crypto", href: "/trainer/crypto" },
              { label: "Cookbook", href: "/cookbook" },
            ].map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <NotificationBell initialNotifications={initialNotifications} accessToken={accessToken} />
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
