"use client";

import Link from "next/link";

interface TrainerNavigationHeaderProps {
  activeTab: "services" | "availability";
}

export function TrainerNavigationHeader({ activeTab }: TrainerNavigationHeaderProps) {
  const navItems = [
    { label: "Your Services", href: "/trainer/services", key: "services" },
    { label: "Weekly Schedule", href: "/trainer/availability", key: "availability" },
  ];

  return (
    <div className="border-b border-border w-full pb-px mt-2 mb-6">
      <nav className="flex items-center gap-6 md:gap-10">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative py-3 text-xs md:text-sm font-bold uppercase tracking-widest transition-colors ${
                isActive
                  ? "text-primary font-extrabold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-primary rounded-full shadow-[0_1px_8px_rgba(74,93,62,0.4)]" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
