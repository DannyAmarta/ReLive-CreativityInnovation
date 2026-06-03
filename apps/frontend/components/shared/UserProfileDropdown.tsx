"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  CalendarDays,
  Utensils,
  Target,
  Bot,
  Wallet,
  Tag,
  Crown,
  Bell,
  ArrowLeftRight,
  Sparkles,
  Settings,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SessionUser } from "@/lib/session.server";
import { cn } from "@/lib/utils";

function initialsFor(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function UserAvatar({
  user,
  className,
}: {
  user: SessionUser;
  className?: string;
}) {
  const initials = initialsFor(user.name);
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name ?? "User"}
        className={cn(
          "rounded-full object-cover ring-1 ring-accent/20 shrink-0",
          className ?? "size-8"
        )}
      />
    );
  }
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-mint text-highlight-foreground font-semibold text-xs shrink-0 ring-1 ring-accent/20",
        className ?? "size-8"
      )}
    >
      {initials}
    </div>
  );
}

interface MenuItemLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

function MenuItemLink({ href, icon, label }: MenuItemLinkProps) {
  return (
    <DropdownMenuItem asChild>
      <Link
        href={href}
        className="flex cursor-pointer items-center gap-2.5 px-2 py-2 text-sm"
      >
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </Link>
    </DropdownMenuItem>
  );
}

export function UserProfileDropdown({
  user,
  currentMode,
}: {
  user: SessionUser;
  currentMode: "client" | "trainer";
}) {
  const router = useRouter();
  const roleLabel = currentMode === "client" ? "Client Account" : "Trainer Account";

  // A user with role USER is not yet a trainer — show Become a Trainer instead of Switch Mode
  const isTrainer = user.role === "TRAINER" || user.role === "ADMIN";
  const switchLabel = currentMode === "client" ? "Trainer Dashboard" : "Client Dashboard";
  const switchHref = currentMode === "client" ? "/trainer" : "/client";

  const sessionsHref = currentMode === "client" ? "/client/dashboard" : "/trainer/bookings";
  const walletHref = currentMode === "client" ? "/client/wallet" : "/trainer/wallet";
  const settingsHref = currentMode === "client" ? "/client" : "/trainer/settings";

  function handleLogout() {
    router.push("/auth/logout?next=/auth/login");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2.5 bg-transparent border-0 appearance-none outline-none cursor-pointer group"
          aria-label="Open profile menu"
        >
          {/* Name + role label (hidden on mobile) */}
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-xs font-semibold">{user.name ?? "User"}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              {roleLabel}
            </p>
          </div>
          {/* Avatar — hover ring here only */}
          <div className="rounded-full ring-2 ring-transparent group-hover:ring-primary/30 group-focus-visible:ring-primary/50 transition-all">
            <UserAvatar user={user} className="size-8" />
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 rounded-xl border border-border bg-background/95 backdrop-blur-xl p-1.5 shadow-lg"
      >
        {/* ── Header ── */}
        <DropdownMenuLabel className="px-2 py-2.5">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} className="size-9" />
            <div className="leading-tight min-w-0">
              <p className="text-sm font-semibold truncate">
                {user.name ?? "User"}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {roleLabel}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* ── Group 1: Personal & Coaching ── */}
        <DropdownMenuGroup>
          {isTrainer ? (
            <MenuItemLink
              href="/trainer/settings"
              icon={<User className="size-4" />}
              label="Profile"
            />
          ) : (
            <></>
          )}
          <MenuItemLink
            href="/profile"
            icon={<Settings className="size-4" />}
            label="Settings"
          />
          <MenuItemLink
            href={sessionsHref}
            icon={<CalendarDays className="size-4" />}
            label="My Sessions"
          />
          {currentMode === "client" && (
            <MenuItemLink
              href="/foods"
              icon={<Utensils className="size-4" />}
              label="Food Calculator"
            />
          )}
          <DropdownMenuItem
            onClick={() => window.dispatchEvent(new Event("open-sage-chat"))}
            className="flex cursor-pointer items-center gap-2.5 px-2 py-2 text-sm"
          >
            <span className="text-muted-foreground">
              <Bot className="size-4" />
            </span>
            AI Coach
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* ── Group 2: Financial & Updates ── */}
        <DropdownMenuGroup>
          <MenuItemLink
            href={walletHref}
            icon={<Wallet className="size-4" />}
            label="Wallet"
          />
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* ── Group 3: My Workspaces ── */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
            My Workspaces
          </DropdownMenuLabel>
          {isTrainer ? (
            <MenuItemLink
              href={switchHref}
              icon={<ArrowLeftRight className="size-4" />}
              label={switchLabel}
            />
          ) : (
            <MenuItemLink
              href="/client/become-trainer"
              icon={<Sparkles className="size-4" />}
              label="Become a Trainer"
            />
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* ── Group 4: Account Actions ── */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex cursor-pointer items-center gap-2.5 px-2 py-2 text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <LogOut className="size-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
