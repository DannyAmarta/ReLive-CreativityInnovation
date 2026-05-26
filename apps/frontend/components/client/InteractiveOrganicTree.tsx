"use client";

import { useStore } from "@/lib/store";
import {
  CalendarCheck,
  Coins,
  ArrowRight,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import type { BookingRecord } from "@/lib/marketplace";

interface InteractiveOrganicTreeProps {
  trainersCount: number;
  servicesCount: number;
  averageRating: number;
  bookingsCount: number;
  lifetimeSpent?: number;
  activeInvested?: number;
  recentBookings?: BookingRecord[];
  trainerAvatars?: (string | null)[];
  pendingRescheduleCount?: number;
  pendingCancellationCount?: number;
}

const formatBookingDate = (startStr?: string | null) => {
  if (!startStr) return "";
  try {
    const d = new Date(startStr);
    return d.toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return "";
  }
};

const formatIDR = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

export default function InteractiveOrganicTree({
  trainersCount,
  servicesCount,
  averageRating,
  bookingsCount,
  lifetimeSpent = 0,
  activeInvested = 0,
  recentBookings = [],
  trainerAvatars = [],
  pendingRescheduleCount = 0,
  pendingCancellationCount = 0,
}: InteractiveOrganicTreeProps) {
  const wallet = useStore((s) => s.wallet);

  const leaves = [
    {
      id: "bookings",
      title: "My Bookings",
      body: "Your dashboard now reflects seal seaded booking instead of local browser state.",
      icon: CalendarCheck,
      svgTransform: "rotate(-45deg)",
      translateClass: "",
      contentTranslateClass: "",
      href: "/client/dashboard",
    },
    {
      id: "wallet-fiat",
      title: "Wallet & Spending",
      body: "Track your fiat payments and fitness investments.",
      icon: Coins,
      svgTransform: "rotate(45deg)",
      translateClass: "",
      contentTranslateClass: "",
      href: "/client/wallet",
    },
    {
      id: "chat",
      title: "Trainer Chat",
      body: "Connect with your trainer.",
      icon: MessageSquare,
      svgTransform: "rotate(-135deg)",
      translateClass: "",
      contentTranslateClass: "",
      href: "/client/messages",
    },
    {
      id: "health-guidebook",
      title: "Health Guidebook",
      body: "Your comprehensive portal for Cookbook, Food Calculator, and Set Lab.",
      icon: BookOpen,
      svgTransform: "rotate(135deg)",
      translateClass: "",
      contentTranslateClass: "",
      href: "/cookbook",
    },
  ];

  const renderLeafInner = (leaf: (typeof leaves)[0]) => {
    const isHealthGuidebook = leaf.id === "health-guidebook";
    const isChat = leaf.id === "chat";
    const isBookings = leaf.id === "bookings";
    const isWalletFiat = leaf.id === "wallet-fiat";

    if (isHealthGuidebook) {
      return (
        <div className="space-y-1.5 text-center flex-grow flex flex-col justify-center items-center h-full w-full px-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(74,93,62,0.08)] text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef] transition-colors shadow-sm">
            <leaf.icon className="h-5 w-5" />
          </span>
          <span className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-[#6c7662] mt-1">
            {leaf.title}
          </span>
          <p className="text-[10.5px] md:text-xs leading-relaxed text-[#67715f] max-w-[95%]">
            {leaf.body}
          </p>
          <div className="text-[11px] md:text-xs font-bold text-[#4a5d3e] flex items-center gap-1 mt-1 group-hover:translate-x-1 transition-transform">
            Open Guidebook <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      );
    }

    if (isChat) {
      return (
        <div className="space-y-1.5 text-center flex-grow flex flex-col justify-center items-center h-full w-full px-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(74,93,62,0.08)] text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef] transition-colors shadow-sm">
            <leaf.icon className="h-5 w-5" />
          </span>
          <span className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-[#6c7662] mt-1">
            {leaf.title}
          </span>
          <p className="text-[10.5px] md:text-xs leading-relaxed text-[#67715f] max-w-[95%]">
            {leaf.body}
          </p>
          <div className="text-[11px] md:text-xs font-bold text-[#4a5d3e] flex items-center gap-1 mt-1 group-hover:translate-x-1 transition-transform">
            Go to Chat <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      );
    }

    if (isBookings) {
      return (
        <div className="space-y-1.5 text-center flex-grow flex flex-col justify-center items-center h-full w-full px-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(74,93,62,0.08)] text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef] transition-colors shadow-sm">
            <leaf.icon className="h-5 w-5" />
          </span>
          <span className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-[#6c7662] mt-1">
            {leaf.title}
          </span>

          <div className="space-y-1 mt-1 w-full max-w-[95%]">
            {recentBookings && recentBookings.length > 0 ? (
              (() => {
                const sorted = [...recentBookings].sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                );
                let activeBooking = sorted.find(
                  (b) => b.status !== "CANCELLED" && b.status !== "REJECTED",
                );
                if (!activeBooking) {
                  activeBooking = sorted[0];
                }

                const serviceTitle =
                  activeBooking.service?.title || "Training Session";
                const status = activeBooking.status;
                const isConfirmed = [
                  "CONFIRMED",
                  "ACTIVE",
                  "COMPLETED",
                ].includes(status.toUpperCase());
                const isCancelledOrRejected = [
                  "CANCELLED",
                  "REJECTED",
                ].includes(status.toUpperCase());

                return (
                  <>
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className="text-xs md:text-sm font-extrabold text-primary-deep truncate max-w-full"
                        title={serviceTitle}
                      >
                        {serviceTitle}
                      </span>
                      <span
                        className={`text-[10px] md:text-[11px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          isConfirmed
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : isCancelledOrRejected
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                    <p className="text-[10px] md:text-[11px] text-[#828d77] font-medium leading-none mt-1">
                      {formatBookingDate(activeBooking.scheduledStart)}
                    </p>
                  </>
                );
              })()
            ) : (
              <p className="text-[10.5px] md:text-xs text-[#828d77] italic leading-normal">
                No upcoming sessions
              </p>
            )}
          </div>
        </div>
      );
    }

    if (isWalletFiat) {
      return (
        <div className="space-y-1.5 text-center flex-grow flex flex-col justify-center items-center h-full w-full px-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(74,93,62,0.08)] text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef] transition-colors shadow-sm">
            <leaf.icon className="h-5 w-5" />
          </span>
          <span className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-[#6c7662] mt-1">
            {leaf.title}
          </span>

          <div className="space-y-1 mt-1">
            <div className="text-[10px] md:text-[11px] text-[#828d77] font-medium leading-none">
              Active Investments
            </div>
            <div className="font-display text-sm md:text-lg font-extrabold text-primary-deep tracking-tight mt-1">
              {formatIDR(activeInvested)}
            </div>
          </div>
        </div>
      );
    }

    // Default fallback
    return (
      <div className="space-y-1.5 text-center flex-grow flex flex-col justify-center items-center h-full w-full px-4">
        <div>
          <div className="flex items-center justify-center gap-2.5">
            {leaf.icon && (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[rgba(74,93,62,0.08)] text-[#4a5d3e] group-hover:bg-[#4a5d3e] group-hover:text-[#f8f6ef] transition-colors">
                <leaf.icon className="h-5 w-5" />
              </span>
            )}
            <span className="text-xs md:text-sm font-extrabold uppercase tracking-wider text-[#6c7662]">
              {leaf.title}
            </span>
          </div>
          <p className="text-[11px] md:text-xs leading-normal text-[#67715f] mt-2">
            {leaf.body}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full overflow-visible py-8 md:py-16">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        <div className="grid gap-16 lg:gap-24 md:grid-cols-[1fr_1.2fr] items-center">
          {/* Left Column: Heading, description, CTA buttons and stats */}
          <div className="space-y-8 z-10">
            <div className="space-y-4">
              <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-primary-deep md:text-[3.55rem] xl:text-[4rem]">
                Find the right <br />
                trainer in a calmer, <br />
                marketplace.
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[#67715f] md:text-lg">
                Browse live seeded trainer profiles, compare real services, and
                keep booking in sync with the backend data your trainer sees.
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

            {/* Stats Block */}
            <div className="inline-flex flex-col gap-6 pt-6 border-t border-[rgba(88,120,74,0.12)] w-fit">
              <div className="flex items-baseline gap-3 w-fit">
                <span className="font-display text-5xl font-extrabold text-primary-deep tracking-tight">
                  {trainersCount}
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6c7662]">
                  Trainers
                </span>
              </div>
              <div className="flex gap-8 w-fit">
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

          {/* Right Column: Clover Leaf Grid */}
          <div className="w-full max-w-[420px] sm:max-w-[480px] md:max-w-[540px] md:ml-auto md:mr-0 mx-auto z-10">
            <div className="grid grid-cols-2 gap-[5px] justify-items-center">
              {leaves.map((leaf) => {
                // Tightly bounding the container since the padding has been stripped from the SVG
                const cardClassName = `relative z-10 hover:z-20 flex flex-col w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 p-0 transition-all duration-300 hover:scale-[1.05] group ${leaf.translateClass} ${leaf.href ? "cursor-pointer" : ""}`;
                const innerContent = renderLeafInner(leaf);

                if (leaf.href) {
                  return (
                    <Link
                      key={leaf.id}
                      href={leaf.href}
                      className={cardClassName}
                    >
                      <svg
                        className="absolute inset-0 w-full h-full text-[rgba(240,246,233,0.85)] group-hover:text-[rgba(224,233,215,0.95)] transition-colors filter drop-shadow-[0_12px_24px_rgba(74,93,62,0.08)] group-hover:drop-shadow-[0_18px_36px_rgba(74,93,62,0.18)]"
                        viewBox="9 9 82 84" // NEW TIGHT BOUNDING BOX
                        preserveAspectRatio="none"
                        style={{ transform: leaf.svgTransform }}
                      >
                        {/* Leaf Blade Body */}
                        <path
                          d="M 50,92 C 30,85 10,70 10,45 C 10,22 30,10 47,18 C 49,19 50,22 50,22 C 50,22 51,19 53,18 C 70,10 90,22 90,45 C 90,70 70,85 50,92 Z"
                          fill="currentColor"
                          stroke="rgba(74,93,62,0.25)"
                          strokeWidth="1.5"
                          className="group-hover:stroke-[#4a5d3e] transition-colors"
                        />
                        {/* Characteristic White Chevron Band */}
                        <path
                          d="M 22,42 Q 50,65 78,42"
                          fill="none"
                          stroke="rgba(255, 255, 255, 0.28)"
                          strokeWidth="7"
                          strokeLinecap="round"
                        />
                        {/* Main central vein */}
                        <path
                          d="M 50,22 L 50,90"
                          fill="none"
                          stroke="rgba(74, 93, 62, 0.18)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        {/* Side veins */}
                        <path
                          d="M 50,40 Q 30,35 22,35 M 50,40 Q 70,35 78,35 M 50,60 Q 32,56 25,58 M 50,60 Q 68,56 75,58"
                          fill="none"
                          stroke="rgba(74, 93, 62, 0.1)"
                          strokeWidth="1"
                          strokeLinecap="round"
                        />
                      </svg>

                      <div
                        className={`relative z-10 flex-1 flex flex-col justify-center items-center h-full w-[85%] mx-auto transition-transform duration-300 ${leaf.contentTranslateClass}`}
                      >
                        {innerContent}
                      </div>
                    </Link>
                  );
                }

                return (
                  <div key={leaf.id} className={cardClassName}>
                    <svg
                      className="absolute inset-0 w-full h-full text-[rgba(240,246,233,0.75)] filter drop-shadow-[0_12px_24px_rgba(74,93,62,0.06)]"
                      viewBox="9 9 82 84" // NEW TIGHT BOUNDING BOX
                      preserveAspectRatio="none"
                      style={{ transform: leaf.svgTransform }}
                    >
                      <path
                        d="M 50,92 C 30,85 10,70 10,45 C 10,22 30,10 47,18 C 49,19 50,22 50,22 C 50,22 51,19 53,18 C 70,10 90,22 90,45 C 90,70 70,85 50,92 Z"
                        fill="currentColor"
                        stroke="rgba(74,93,62,0.25)"
                        strokeWidth="1.5"
                      />
                      <path
                        d="M 22,42 Q 50,65 78,42"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.28)"
                        strokeWidth="7"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 50,22 L 50,90"
                        fill="none"
                        stroke="rgba(74, 93, 62, 0.18)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 50,40 Q 30,35 22,35 M 50,40 Q 70,35 78,35 M 50,60 Q 32,56 25,58 M 50,60 Q 68,56 75,58"
                        fill="none"
                        stroke="rgba(74, 93, 62, 0.1)"
                        strokeWidth="1"
                        strokeLinecap="round"
                      />
                    </svg>

                    <div
                      className={`relative z-10 flex-1 flex flex-col justify-center items-center h-full w-[85%] mx-auto transition-transform duration-300 ${leaf.contentTranslateClass}`}
                    >
                      {innerContent}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
