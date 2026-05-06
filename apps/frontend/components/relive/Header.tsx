"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf } from "lucide-react";
import { WalletButton } from "./WalletButton";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/client", label: "Home" },
  { href: "/client/trainers", label: "Trainers" },
  { href: "/client/dashboard", label: "Dashboard" },
  { href: "/trainer", label: "Trainer Hub" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/client" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-primary-deep">
            ReLive
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((n) => {
              const isActive = pathname === n.href;
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary-deep" 
                      : "text-muted-foreground hover:text-primary-deep"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}