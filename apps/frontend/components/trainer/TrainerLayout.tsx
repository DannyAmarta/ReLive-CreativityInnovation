import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "@/public/assets/wallpaper/logo.png";
import { NotificationBell } from "./NotificationBell";
import { Avatar } from "./Avatar";
import { cn } from "@/lib/utils";
import { trainerProfile, avatarFor } from "@/lib/mock-data";

const navItems = [
  { to: "/trainer", label: "Dashboard", end: true },
  { to: "/trainer/bookings", label: "Bookings" },
  { to: "/trainer/services", label: "Services" },
  { to: "/trainer/wallet", label: "Wallet" },
  { to: "/trainer/messages", label: "Messages" },
  { to: "/trainer/settings", label: "Settings" },
];

export function TrainerLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // close mobile menu on route change
  if (open && typeof window !== "undefined") {
    // simple: useEffect would be cleaner but this is fine
  }

  return (
    <div className="min-h-dvh bg-gradient-surface text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <NavLink to="/trainer" className="flex items-center gap-2.5 shrink-0">
            <img src={Logo} alt="ReLive Logo" className="size-8 rounded-lg object-cover" />
            <div className="leading-tight">
              <p className="font-semibold text-sm tracking-tight">ReLive</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground -mt-0.5">Trainer Hub</p>
            </div>
          </NavLink>

          <nav className="hidden lg:flex items-center gap-7 h-full">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => cn("nav-link h-full flex items-center", isActive && "active")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationBell initialNotifications={[]} />
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

        {open && (
          <nav className="lg:hidden border-t border-border bg-background animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "px-3 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </header>

      <main key={location.pathname} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
