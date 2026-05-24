"use client";

import { useEffect, useRef, useState } from "react";
import { useStore, actions } from "@/lib/store";
import {
  Sparkles,
  Shield,
  CalendarCheck,
  UserCheck,
  Coins,
  Zap,
  ArrowRight,
  Wallet,
  LogOut,
  Heart,
  CalendarClock,
  CircleSlash,
  CalendarDays,
  Dumbbell,
  BookOpen,
  Utensils,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import type { BookingRecord } from "@/lib/marketplace";

interface InteractiveOrganicTreeProps {
  trainersCount: number;
  servicesCount: number;
  averageRating: number;
  bookingsCount: number;
  lifetimeSpent?: number;
  recentBookings?: BookingRecord[];
  trainerAvatars?: (string | null)[];
  pendingRescheduleCount?: number;
  pendingCancellationCount?: number;
}

const truncateAddress = (a?: string) =>
  !a ? "" : `${a.slice(0, 4)}…${a.slice(-4)}`;

const formatBookingDate = (startStr?: string | null) => {
  if (!startStr) return "";
  try {
    const d = new Date(startStr);
    return d.toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch (e) {
    return "";
  }
};

const formatIDR = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(val);
};

const renderAvatar = (src: string | null | undefined, name?: string, index?: number) => {
  if (src) {
    return (
      <img
        key={index}
        src={src}
        alt={name || "Trainer"}
        className="w-6 h-6 rounded-full border border-white object-cover shadow-sm -ml-2 first:ml-0"
      />
    );
  }
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  return (
    <div
      key={index}
      className="w-6 h-6 rounded-full border border-white bg-[#eef3e6] text-[#4a5d3e] text-[9px] font-bold flex items-center justify-center shadow-sm -ml-2 first:ml-0"
      title={name || "Trainer"}
    >
      {initials}
    </div>
  );
};

export default function InteractiveOrganicTree({
  trainersCount,
  servicesCount,
  averageRating,
  bookingsCount,
  lifetimeSpent = 0,
  recentBookings = [],
  trainerAvatars = [],
  pendingRescheduleCount = 0,
  pendingCancellationCount = 0
}: InteractiveOrganicTreeProps) {
  const wallet = useStore((s) => s.wallet);

  // Refs for dynamic connection lines between left stats and right tree
  const containerRef = useRef<HTMLDivElement>(null);
  const trainersStatRef = useRef<HTMLDivElement>(null);
  const otherStatsRef = useRef<HTMLDivElement>(null);
  const walletLeafRef = useRef<any>(null);

  const [forkPaths, setForkPaths] = useState({
    topFork: "",
    bottomFork: "",
    mainStem: ""
  });

  useEffect(() => {
    const updateConnector = () => {
      if (
        !containerRef.current ||
        !trainersStatRef.current ||
        !otherStatsRef.current ||
        !walletLeafRef.current
      )
        return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const trainersRect = trainersStatRef.current.getBoundingClientRect();
      const otherRect = otherStatsRef.current.getBoundingClientRect();
      const walletRect = walletLeafRef.current.getBoundingClientRect();

      // Coordinates relative to container
      const topX = trainersRect.right - containerRect.left;
      const topY = trainersRect.top + trainersRect.height / 2 - containerRect.top;

      const botX = otherRect.right - containerRect.left;
      const botY = otherRect.top + otherRect.height / 2 - containerRect.top;

      const walletX = walletRect.left - containerRect.left;
      const walletY = walletRect.top + walletRect.height / 2 - containerRect.top;

      // Merge point is 40px right of the stats, vertically centered
      const mergeX = Math.max(topX, botX) + 40;
      const mergeY = (topY + botY) / 2;

      // Curved paths for the fork
      const topForkPath = `M ${topX} ${topY} C ${topX + 20} ${topY}, ${mergeX - 25} ${mergeY}, ${mergeX} ${mergeY}`;
      const botForkPath = `M ${botX} ${botY} C ${botX + 20} ${botY}, ${mergeX - 25} ${mergeY}, ${mergeX} ${mergeY}`;

      // Main stem curve connecting merge point to wallet leaf
      const mainStemPath = `M ${mergeX} ${mergeY} C ${(mergeX + walletX) / 2} ${mergeY}, ${(mergeX + walletX) / 2} ${walletY}, ${walletX} ${walletY}`;

      setForkPaths({
        topFork: topForkPath,
        bottomFork: botForkPath,
        mainStem: mainStemPath
      });
    };

    // Wait a tick for layout/fonts to stabilize
    const timer = setTimeout(updateConnector, 250);
    window.addEventListener("resize", updateConnector);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateConnector);
    };
  }, []);

  const cx = 400;
  const cy = 400;

  // Optimized leaf positions (spread out to guarantee zero overlap)
  const leaves = [
    {
      id: "catalog",
      title: "Search Cookbook",
      body: "Being starve?",
      icon: BookOpen,
      x: 240,
      y: 110,
      borderRadius: "15px 120px 120px 120px",
      rotate: "rotate-[-4deg]",
      href: "/cookbook"
    },
    {
      id: "favorites",
      title: "Food Calculator",
      body: "Calculate your food material!",
      icon: Utensils,
      x: 560,
      y: 110,
      borderRadius: "120px 15px 120px 120px",
      rotate: "rotate-[6deg]",
      href: "/foods"
    },
    {
      id: "chat",
      title: "Trainer Chat",
      body: "Connect with your trainer.",
      icon: MessageSquare,
      x: 720,
      y: 310,
      borderRadius: "120px 120px 15px 120px",
      rotate: "rotate-[2deg]",
      href: "/client/messages"
    },
    {
      id: "bookings",
      title: "My Bookings",
      body: "Your dashboard now reflects seal seaded booking instead of local browser state.",
      icon: CalendarCheck,
      x: 700,
      y: 550,
      borderRadius: "120px 120px 120px 15px",
      rotate: "rotate-[8deg]",
      href: "/client/dashboard"
    },
    {
      id: "cancel-session",
      title: "Cancel Session",
      body: "Cancellation and refund for active sessions.",
      icon: CircleSlash,
      x: 480,
      y: 730,
      borderRadius: "120px 120px 120px 15px",
      rotate: "rotate-[4deg]",
      href: "/client/bookings/cancel"
    },
    {
      id: "wallet-fiat",
      title: "Wallet & Spending",
      body: "Track your fiat payments and fitness investments.",
      icon: Coins,
      x: 200,
      y: 700,
      borderRadius: "120px 120px 15px 120px",
      rotate: "rotate-[-6deg]",
      href: "/client/wallet"
    },
    {
      id: "wallet",
      title: "Set Lab",
      body: "Make your own plan routines.",
      icon: Dumbbell,
      x: 80,
      y: 510,
      borderRadius: "15px 120px 120px 120px",
      rotate: "rotate-[-8deg]",
      href: "/set"
    },
    {
      id: "reschedule",
      title: "Reschedule",
      body: "Propose new times for your active sessions.",
      icon: CalendarClock,
      x: 100,
      y: 300,
      borderRadius: "120px 15px 120px 120px",
      rotate: "rotate-[-2deg]",
      href: "/client/bookings/reschedule"
    }
  ];

  const renderLeafInner = (leaf: typeof leaves[0]) => {
    const isWallet = leaf.id === "wallet";
    const isChat = leaf.id === "chat";
    const isCatalog = leaf.id === "catalog";
    const isFavorites = leaf.id === "favorites";
    const isBookings = leaf.id === "bookings";
    const isWalletFiat = leaf.id === "wallet-fiat";
    const isReschedule = leaf.id === "reschedule";
    const isCancelSession = leaf.id === "cancel-session";

    if (isWallet) {
      return (
        <div className="space-y-3 text-left flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c7662]">
                Set Lab
              </span>
              <Dumbbell className="h-4 w-4 text-[#4a5d3e]" />
            </div>
            <p className="text-[10px] leading-relaxed text-[#67715f] mt-2.5">
              {leaf.body}
            </p>
          </div>
          <div className="pt-2">
            <div className="w-full flex items-center justify-center gap-1.5 rounded-full bg-[#4a5d3e] py-2 px-3 text-xs font-bold text-[#f8f6ef] shadow-[0_8px_16px_rgba(74,93,62,0.15)] hover:bg-[#3d4f32] transition-colors">
              Calculate Now
            </div>
          </div>
        </div>
      );
    }

    if (isChat) {
      return (
        <div className="space-y-3 text-left flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              {leaf.icon && (
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[rgba(74,93,62,0.08)] text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef] transition-colors">
                  <leaf.icon className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c7662]">
                {leaf.title}
              </span>
            </div>
            <p className="text-[10px] leading-normal text-[#67715f] mt-2.5">
              {leaf.body}
            </p>
          </div>
          <div className="text-[9px] font-bold text-[#4a5d3e] flex items-center gap-0.5 mt-1.5 group-hover:translate-x-0.5 transition-transform">
            Go to Chat <ArrowRight className="h-2.5 w-2.5" />
          </div>
        </div>
      );
    }

    if (isCatalog) {
      return (
        <div className="space-y-3 text-left flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              {leaf.icon && (
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[rgba(74,93,62,0.08)] text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef] transition-colors">
                  <leaf.icon className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c7662]">
                {leaf.title}
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-[#67715f] mt-2.5">
              {leaf.body}
            </p>
          </div>
          <div className="text-[9px] font-bold text-[#4a5d3e] flex items-center gap-0.5 mt-1.5 group-hover:translate-x-0.5 transition-transform">
            Browse Recipes <ArrowRight className="h-2.5 w-2.5" />
          </div>
        </div>
      );
    }

    if (isFavorites) {
      return (
        <div className="space-y-3 text-left flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              {leaf.icon && (
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[rgba(244,63,94,0.1)] text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                  <leaf.icon className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700/80">
                {leaf.title}
              </span>
            </div>
            <p className="text-[10px] leading-relaxed text-[#67715f] mt-2.5">
              {leaf.body}
            </p>
          </div>
          <div className="text-[9px] font-bold text-rose-600 flex items-center gap-0.5 mt-1.5 group-hover:translate-x-0.5 transition-transform">
            Calculate Macros <ArrowRight className="h-2.5 w-2.5" />
          </div>
        </div>
      );
    }

    if (isBookings) {
      return (
        <div className="space-y-3 text-left flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              {leaf.icon && (
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[rgba(74,93,62,0.08)] text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef] transition-colors">
                  <leaf.icon className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c7662]">
                {leaf.title}
              </span>
            </div>
            
            <div className="space-y-1.5 mt-2.5">
              {recentBookings && recentBookings.length > 0 ? (
                (() => {
                  const activeBooking = recentBookings[0];
                  const serviceTitle = activeBooking.service?.title || "Training Session";
                  const status = activeBooking.status;
                  const isConfirmed = status.toUpperCase() === "CONFIRMED";
                  
                  return (
                    <>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-primary-deep truncate max-w-[55%]" title={serviceTitle}>
                          {serviceTitle}
                        </span>
                        <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          isConfirmed 
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-[9px] text-[#828d77] font-medium leading-none">
                        {formatBookingDate(activeBooking.scheduledStart)}
                      </p>
                    </>
                  );
                })()
              ) : (
                <p className="text-[10px] text-[#828d77] italic leading-normal">
                  No upcoming sessions
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (isWalletFiat) {
      return (
        <div className="space-y-3 text-left flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              {leaf.icon && (
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-[rgba(74,93,62,0.08)] text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef] transition-colors">
                  <leaf.icon className="h-3.5 w-3.5" />
                </span>
              )}
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c7662]">
                {leaf.title}
              </span>
            </div>
            
            <div className="space-y-1 mt-2.5">
              <div className="text-[10px] text-[#828d77] font-medium">
                Lifetime Spent
              </div>
              <div className="font-display text-sm font-extrabold text-primary-deep tracking-tight">
                {formatIDR(lifetimeSpent)}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isReschedule) {
      const hasPending = pendingRescheduleCount > 0;
      return (
        <div className="space-y-3 text-left flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[rgba(74,93,62,0.08)] text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef] transition-colors">
                <CalendarClock className="h-3.5 w-3.5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c7662]">
                Reschedule
              </span>
            </div>
            
            <div className="mt-2.5">
              {hasPending ? (
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[9px] font-bold text-amber-700">
                    <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse" />
                    {pendingRescheduleCount} pending
                  </div>
                  <p className="text-[9px] font-medium text-[#806c62] leading-tight">
                    Action required: review new proposal timings.
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-primary-deep">
                    Adjust Timings
                  </p>
                  <p className="text-[9px] text-[#828d77] leading-relaxed">
                    Shift active sessions to new available calendar slots.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="text-[9px] font-bold text-primary flex items-center gap-0.5 mt-1.5 group-hover:translate-x-0.5 transition-transform">
            Go to Reschedule <ArrowRight className="h-2.5 w-2.5" />
          </div>
        </div>
      );
    }

    if (isCancelSession) {
      const hasPending = pendingCancellationCount > 0;
      return (
        <div className="space-y-3 text-left flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[rgba(244,63,94,0.08)] text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <CircleSlash className="h-3.5 w-3.5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700/80">
                Cancel Session
              </span>
            </div>
            
            <div className="mt-2.5">
              {hasPending ? (
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 text-[9px] font-bold text-rose-700">
                    <span className="h-1 w-1 rounded-full bg-rose-500 animate-pulse" />
                    {pendingCancellationCount} requested
                  </div>
                  <p className="text-[9px] font-medium text-rose-600 leading-tight">
                    Action required: client or trainer wants cancellation.
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-primary-deep">
                    Mutual Refund
                  </p>
                  <p className="text-[9px] text-[#828d77] leading-relaxed">
                    Request refund. Trainer/Client must agree to complete.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="text-[9px] font-bold text-rose-600 flex items-center gap-0.5 mt-1.5 group-hover:translate-x-0.5 transition-transform">
            Go to Cancel <ArrowRight className="h-2.5 w-2.5" />
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="space-y-2 text-left flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2">
            {leaf.icon && (
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-[rgba(74,93,62,0.08)] text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef] transition-colors">
                <leaf.icon className="h-3.5 w-3.5" />
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6c7662]">
              {leaf.title}
            </span>
          </div>
          <p className="text-[10px] leading-normal text-[#67715f] mt-2">
            {leaf.body}
          </p>
        </div>
      </div>
    );
  };

  // Helper to generate the premium swirling paths starting at the center circle
  const getSwirlPath = (lx: number, ly: number) => {
    const dx = lx - cx;
    const dy = ly - cy;
    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Dynamic spiral layout coordinates
    const cp1Angle = angle - Math.PI / 4.5;
    const cp1Dist = dist * 0.45;
    const cp1x = cx + Math.cos(cp1Angle) * cp1Dist;
    const cp1y = cy + Math.sin(cp1Angle) * cp1Dist;

    const cp2Angle = angle - Math.PI / 15;
    const cp2Dist = dist * 0.75;
    const cp2x = cx + Math.cos(cp2Angle) * cp2Dist;
    const cp2y = cy + Math.sin(cp2Angle) * cp2Dist;

    return `M ${cx} ${cy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${lx} ${ly}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-visible py-8 md:py-16"
    >
      {/* Universal SVGs for connection paths (Desktop only) */}
      <svg
        className="absolute inset-0 pointer-events-none hidden md:block"
        style={{ width: "100%", height: "100%", zIndex: 0 }}
      >
        <defs>
          {/* Glowing White/Cream Line Gradients */}
          <linearGradient id="branch-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fffdf6" stopOpacity="0.2" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#f2eae0" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#fffdf6" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="stats-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#f2eae0" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4.5" result="blur" />
            <feComponentTransfer in="blur" result="glow1">
              <feFuncA type="linear" slope="0.8" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode in="glow1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Dynamic connection split-fork paths from stats block to Wallet leaf */}
        {forkPaths.topFork && (
          <g
            filter="url(#glow)"
            stroke="currentColor"
            fill="none"
            strokeDasharray="5 3"
            className="text-[#8a9a6b]/40 dark:text-[#dce6cf]/55 transition-colors"
          >
            <path
              d={forkPaths.topFork}
              strokeWidth="2"
              className="opacity-95"
            />
            <path
              d={forkPaths.bottomFork}
              strokeWidth="2"
              className="opacity-95"
            />
            <path
              d={forkPaths.mainStem}
              strokeWidth="2.5"
              className="opacity-95"
            />
          </g>
        )}
      </svg>

      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        <div className="grid gap-16 lg:gap-24 md:grid-cols-[1fr_1.2fr] items-center">
          {/* Left Column: Heading, description, CTA buttons and connected stats */}
          <div className="space-y-8 z-10">
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-primary-deep md:text-[3.55rem] xl:text-[4rem]">
                Find the right <br />
                trainer in a calmer, <br />
                marketplace.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[#67715f] md:text-lg">
                Browse live seeded trainer profiles, compare real services, and
                keepy booking in sync with the backend data your trainer sees.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/client/trainers"
                className="inline-flex items-center gap-2 rounded-full bg-[#4a5d3e] px-7 py-4 text-sm font-semibold text-[#f8f6ef] shadow-[0_16px_32px_rgba(74,93,62,0.22)] transition-all hover:bg-[#3d4f32] hover:-translate-y-0.5"
              >
                Browse trainers <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/client/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-[rgba(88,120,74,0.18)] bg-[rgba(255,252,246,0.92)] px-7 py-4 text-sm font-semibold text-[#31442a] shadow-[0_10px_20px_rgba(0,0,0,0.02)] transition-all hover:bg-[rgba(238,243,230,0.95)] hover:-translate-y-0.5"
              >
                Your bookings
              </Link>
            </div>

            {/* Stats Block (acts as a starting point for connection line to wallet leaf) */}
            <div className="inline-flex flex-col gap-6 pt-6 border-t border-[rgba(88,120,74,0.12)] w-fit">
              {/* Top Fork Point */}
              <div
                ref={trainersStatRef}
                className="flex items-baseline gap-3 w-fit"
              >
                <span className="font-display text-5xl font-extrabold text-primary-deep tracking-tight">
                  {trainersCount}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7662]">
                  Trainers
                </span>
              </div>
              {/* Bottom Fork Point */}
              <div ref={otherStatsRef} className="flex gap-8 w-fit">
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-primary-deep">
                    {servicesCount}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6c7662]">
                    Services
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-primary-deep">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6c7662]">
                    Avg Rating
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: The Organic Tree Container */}
          <div className="relative w-full max-w-[700px] aspect-square md:ml-auto md:mr-0 mx-auto md:block flex flex-col gap-6">
            {/* Background SVG for Tree Branch Network (Desktop only) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none hidden md:block"
              viewBox="0 0 800 800"
              style={{ zIndex: 0 }}
            >
              {/* Center counter text path (Radius increased to 130 for spacing) */}
              <path
                id="text-curve"
                d="M 270,400 A 130,130 0 0,1 530,400"
                fill="none"
              />

              {/* Branch paths linking center circle (400, 400) to each leaf node */}
              <g
                stroke="currentColor"
                strokeWidth="2.5"
                fill="none"
                filter="url(#glow)"
                className="text-[#8a9a6b]/35 dark:text-[#dce6cf]/50 transition-colors"
              >
                {leaves.map((leaf) => (
                  <path key={leaf.id} d={getSwirlPath(leaf.x, leaf.y)} />
                ))}
              </g>

              {/* Curved Text Arc */}
              <text className="fill-[#6c7662] text-[11px] font-bold tracking-[0.16em] uppercase">
                <textPath
                  href="#text-curve"
                  startOffset="50%"
                  textAnchor="middle"
                >
                  System Integrity & Features
                </textPath>
              </text>
            </svg>

            {/* Desktop Layout: Orbiting Leaf Cards */}
            <div
              className="absolute inset-0 hidden md:block"
              style={{ zIndex: 10 }}
            >
              {/* Central Circle */}
              <div className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-[rgba(255,255,255,0.45)] bg-[rgba(255,252,246,0.85)] shadow-[0_20px_45px_rgba(74,93,62,0.06),0_1px_3px_rgba(0,0,0,0.01)] backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center z-20">
                <span className="font-display text-5xl font-extrabold text-[#31442a] leading-none">
                  {bookingsCount}
                </span>
                <p className="mt-2 text-[10px] leading-normal text-[#67715f]">
                  Great work! Bookings you've made so far.
                </p>
              </div>

              {/* Orbital Leaves */}
              {leaves.map((leaf) => {
                const isWallet = leaf.id === "wallet";
                const isFavorites = leaf.id === "favorites";

                let cardClassName = `absolute flex flex-col w-52 p-5 backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] group ${leaf.rotate} ${leaf.href ? "cursor-pointer" : ""}`;

                if (isFavorites) {
                  cardClassName += ` bg-[rgba(255,241,242,0.65)] hover:bg-[rgba(255,228,230,0.75)] border border-[rgba(244,63,94,0.35)] hover:border-[rgba(244,63,94,0.6)] shadow-[0_16px_36px_rgba(244,63,94,0.08)] hover:shadow-[0_24px_48px_rgba(244,63,94,0.18)]`;
                } else if (leaf.href) {
                  cardClassName += ` bg-[rgba(255,252,246,0.75)] hover:bg-[rgba(255,252,246,0.9)] border border-[rgba(74,93,62,0.25)] hover:border-[#4a5d3e] shadow-[0_16px_36px_rgba(74,93,62,0.08)] hover:shadow-[0_24px_48px_rgba(74,93,62,0.15)]`;
                } else {
                  cardClassName += ` bg-[rgba(255,252,246,0.65)] border border-[rgba(255,255,255,0.45)] shadow-[0_16px_36px_rgba(74,93,62,0.06),0_1px_3px_rgba(0,0,0,0.02)]`;
                }

                const cardStyle = {
                  left: `${(leaf.x / 800) * 100}%`,
                  top: `${(leaf.y / 800) * 100}%`,
                  transform: `translate(-50%, -50%)`,
                  borderRadius: leaf.borderRadius,
                };

                const innerContent = renderLeafInner(leaf);

                if (leaf.href) {
                  return (
                    <Link
                      key={leaf.id}
                      href={leaf.href}
                      ref={isWallet ? walletLeafRef : undefined}
                      className={cardClassName}
                      style={cardStyle}
                    >
                      {innerContent}
                    </Link>
                  );
                }

                return (
                  <div
                    key={leaf.id}
                    ref={isWallet ? walletLeafRef : undefined}
                    className={cardClassName}
                    style={cardStyle}
                  >
                    {innerContent}
                  </div>
                );
              })}
            </div>

            {/* Mobile View Layout: Cascading Stack of Leaf Cards */}
            <div className="flex md:hidden flex-col gap-4 mt-6 z-10">
              {/* Central counter summary for mobile */}
              <div className="flex items-center gap-4 p-5 bg-[rgba(255,252,246,0.92)] border border-[rgba(88,120,74,0.14)] rounded-[20px] shadow-card">
                <span className="font-display text-4xl font-extrabold text-primary-deep">
                  {bookingsCount}
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6c7662]">
                    Active Bookings
                  </p>
                  <p className="text-[11px] leading-normal text-[#67715f]">
                    Great work! Bookings you've made so far.
                  </p>
                </div>
              </div>

              {/* Mobile Leaves Grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {leaves.map((leaf) => {
                  const isFavorites = leaf.id === "favorites";

                  let cardClassName = `p-5 border shadow-card flex flex-col transition-all duration-300 ${leaf.href ? "cursor-pointer hover:scale-[1.01]" : ""}`;

                  if (isFavorites) {
                    cardClassName += ` bg-[rgba(255,241,242,0.92)] border-[rgba(244,63,94,0.3)]`;
                  } else if (leaf.href) {
                    cardClassName += ` bg-[rgba(255,252,246,0.92)] border-[rgba(74,93,62,0.25)] hover:border-[#4a5d3e]`;
                  } else {
                    cardClassName += ` bg-[rgba(255,252,246,0.92)] border-[rgba(88,120,74,0.14)]`;
                  }

                  const cardStyle = { borderRadius: leaf.borderRadius };
                  const innerContent = renderLeafInner(leaf);

                  if (leaf.href) {
                    return (
                      <Link
                        key={leaf.id}
                        href={leaf.href}
                        className={cardClassName}
                        style={cardStyle}
                      >
                        {innerContent}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={leaf.id}
                      className={cardClassName}
                      style={cardStyle}
                    >
                      {innerContent}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
