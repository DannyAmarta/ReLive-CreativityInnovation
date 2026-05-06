"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NotificationBell } from "@/components/trainer/NotificationBell";
import { Avatar } from "@/components/trainer/Avatar";
import { cn } from "@/lib/utils";
import { trainerProfile, avatarFor } from "@/lib/mock-data";

const navItems = [
  { href: "/trainer",           label: "Dashboard", exact: true },
  { href: "/trainer/bookings",  label: "Bookings"               },
  { href: "/trainer/services",  label: "Services"               },
  { href: "/trainer/wallet",    label: "Wallet"                 },
  { href: "/trainer/messages",  label: "Messages"               },
  { href: "/trainer/settings",  label: "Settings"               },
];

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <div className="min-h-dvh bg-gradient-surface text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/trainer" className="flex items-center gap-2.5 shrink-0">
            <div className="relative size-8 rounded-lg bg-gradient-primary shadow-glow flex items-center justify-center">
              <div className="size-3 rounded-sm bg-highlight" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-sm tracking-tight">ReLive</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground -mt-0.5">Trainer Hub</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7 h-full">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "nav-link h-full flex items-center text-sm font-medium transition-colors",
                    isActive ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell />
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-border h-8">
              <div className="text-right leading-tight">
                <p className="text-xs font-semibold">{trainerProfile.displayName}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Elite Trainer</p>
              </div>
              <Avatar initials={avatarFor(trainerProfile.displayName)} className="size-8" />
            </div>
            <button
              className="lg:hidden size-9 rounded-lg border border-border bg-card flex items-center justify-center"
              onClick={() => setOpen((o) => !o)}
              aria-label="Toggle menu"
            >
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {open && (
          <nav className="lg:hidden border-t border-border bg-background animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col">
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in">
        {children}
      </main>
    </div>
  );
}
