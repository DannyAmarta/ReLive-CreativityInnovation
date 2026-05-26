"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface HealthGuidebookLayoutProps {
  children: React.ReactNode;
}

export default function HealthGuidebookLayout({ children }: HealthGuidebookLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Cookbook", href: "/client/health-guidebook/cookbook" },
    { label: "Food Calculator", href: "/client/health-guidebook/foods" },
    { label: "Set Lab", href: "/client/health-guidebook/set" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fbf8f1] relive-grid text-[#233126]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[rgba(88,120,74,0.1)] bg-[rgba(251,248,241,0.96)] backdrop-blur-md px-6 py-4">
        <div className="mx-auto max-w-[1200px] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Back Button */}
          <Link
            href="/client"
            className="inline-flex items-center gap-2 rounded-full border border-[rgba(88,120,74,0.18)] bg-white px-4.5 py-2 text-xs font-bold text-[#31442a] shadow-sm transition-all hover:bg-[#eef3e6] hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
          </Link>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-8 md:gap-14">
            {navItems.map((item) => {
              // Exact or prefix match, but exact match is best here
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-2 text-xs md:text-sm font-bold uppercase tracking-widest transition-colors ${
                    isActive
                      ? "text-[#5c3d2e] dark:text-[#a07462]"
                      : "text-[#6c7662] hover:text-[#31442a]"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#5c3d2e] dark:bg-[#a07462] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Spacer to center layout on wider screens */}
          <div className="hidden sm:block w-36" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
}
