"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface HealthGuidebookHeaderProps {
  activeTab: "cookbook" | "foods" | "set";
  userRole?: string;
}

export function HealthGuidebookHeader({ activeTab, userRole }: HealthGuidebookHeaderProps) {
  const navItems = [
    { label: "Cookbook", href: "/cookbook", key: "cookbook" },
    { label: "Food Calculator", href: "/foods", key: "foods" },
    { label: "Set Lab", href: "/set", key: "set" },
  ];

  const dashboardHref = userRole === "TRAINER" ? "/trainer" : "/client";

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(88,120,74,0.08)] bg-white/80 backdrop-blur-md px-6 py-4 w-full">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Back Button */}
        <Link
          href={dashboardHref}
          className="inline-flex items-center gap-2 rounded-full border border-[rgba(88,120,74,0.15)] bg-white px-4.5 py-2 text-xs font-bold text-[#31442a] shadow-sm transition-all hover:bg-[#eef3e6] hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
        </Link>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-8 md:gap-14">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative py-2 text-xs md:text-sm font-bold uppercase tracking-widest transition-colors ${
                  isActive
                    ? "text-[#2d4a22] font-extrabold"
                    : "text-[#6c7662] hover:text-[#31442a]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#2d4a22] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Spacer to center tabs on large screen */}
        <div className="hidden sm:block w-36" />
      </div>
    </header>
  );
}
