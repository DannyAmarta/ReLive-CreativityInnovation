import { Link } from "@tanstack/react-router";
import { Leaf } from "lucide-react";
import { WalletButton } from "./WalletButton";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/trainers", label: "Trainers" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/trainer/fiat-wallet", label: "Trainer Hub" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Leaf className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-primary-deep">
            ReLive
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                activeProps={{
                  className: "bg-primary/10 text-primary-deep",
                }}
                inactiveProps={{ className: "text-muted-foreground hover:text-primary-deep" }}
                className="rounded-full px-4 py-2 text-sm font-medium transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <WalletButton />
        </div>
      </div>
    </header>
  );
}