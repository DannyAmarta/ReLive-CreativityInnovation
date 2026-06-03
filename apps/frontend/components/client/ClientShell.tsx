"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Logo from "@/public/assets/wallpaper/logo.png";
import { Toaster } from "sonner";
import { NotificationBell } from "@/components/trainer/NotificationBell";
import { WalletButton } from "@/components/relive/WalletButton";
import { UserProfileDropdown } from "@/components/shared/UserProfileDropdown";
import type { SessionUser } from "@/lib/session.server";
import type { NotificationRecord } from "@/lib/actions/notifications";

export default function ClientShell({
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
  const [allNotifications, setAllNotifications] = useState<NotificationRecord[]>(initialNotifications);

  useEffect(() => {
    // Parse URL query params manually to avoid NextJS Suspense deoptimization warnings
    const params = new URLSearchParams(window.location.search);
    const payment = params.get("payment");
    const bookingId = params.get("booking");
    const resultCode = params.get("resultCode");

    const dynamicNotifs: NotificationRecord[] = [];
    if (payment === "crypto-pending" && bookingId) {
      dynamicNotifs.push({
        id: -1,
        title: "⏳ Crypto Booking Pending",
        body: `Crypto booking #${bookingId} created. Please sign on-chain escrow to activate.`,
        link: `/client/dashboard?booking=${bookingId}&payment=crypto-pending`,
        read: false,
        createdAt: new Date().toISOString(),
      });
    }
    if (payment === "fiat-pending" && bookingId) {
      if (resultCode === "01") {
        dynamicNotifs.push({
          id: -2,
          title: "❌ Payment Cancelled",
          body: `Booking #${bookingId} payment was cancelled. Try booking again.`,
          link: `/client/dashboard?booking=${bookingId}&payment=fiat-pending&resultCode=01`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      } else if (resultCode && resultCode !== "00") {
        dynamicNotifs.push({
          id: -3,
          title: "❌ Payment Failed",
          body: `Booking #${bookingId} payment failed (Result: ${resultCode}).`,
          link: `/client/dashboard?booking=${bookingId}&payment=fiat-pending&resultCode=${resultCode}`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      } else if (!resultCode) {
        dynamicNotifs.push({
          id: -4,
          title: "ℹ️ Payment Pending",
          body: `Booking #${bookingId} payment session could not be started automatically.`,
          link: `/client/dashboard?booking=${bookingId}&payment=fiat-pending`,
          read: false,
          createdAt: new Date().toISOString(),
        });
      }
    }

    if (dynamicNotifs.length > 0) {
      setAllNotifications((prev) => {
        const filteredPrev = prev.filter((n) => n.id >= 0);
        return [...dynamicNotifs, ...filteredPrev];
      });
    } else {
      setAllNotifications(initialNotifications);
    }
  }, [initialNotifications]);
  return (
    <div className="min-h-dvh bg-gradient-surface text-foreground">
      <Toaster richColors position="top-right" />
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/client" className="flex items-center gap-2.5 shrink-0">
            <Image src={Logo} alt="ReLive Logo" className="size-8 rounded-lg object-cover" />
            <div className="leading-tight">
              <p className="font-semibold text-sm tracking-tight">ReLive</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground -mt-0.5">Client Hub</p>
            </div>
          </Link>

          {/* Navigation Topbar */}
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto mx-4">
            {[
              { label: "Trainers", href: "/client/trainers" },
              { label: "Sessions", href: "/client/dashboard" },
              { label: "Wallet", href: "/client/wallet" },
              { label: "Messages", href: "/client/messages" },
              { label: "GuideBook", href: "/cookbook" },
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
            <WalletButton />
            <NotificationBell initialNotifications={allNotifications} accessToken={accessToken} />
            {/* Divider */}
            <div className="hidden sm:block h-8 w-px bg-border" />
            {/* Profile Dropdown */}
            <UserProfileDropdown user={user} currentMode="client" />
          </div>
        </div>
      </header>

      <main className="max-w-[1380px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in">
        {children}
      </main>
    </div>
  );
}

