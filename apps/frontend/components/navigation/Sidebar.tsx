"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarItem } from "./SidebarItem";
import {
  Globe2,
  Dumbbell,
  Utensils,
  BookOpenText,
  User,
  Settings,
  Menu,
  X,
  Sparkles,
  LogOut
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Fallback for paths without pathname (e.g. during build or tests)
  const currentPath = pathname || "";

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleMobile = () => setIsMobileOpen(!isMobileOpen);

    const links = [
      { href: "/world", label: "World", icon: Globe2 },
      { href: "/foods", label: "Foods", icon: Utensils },
      { href: "/workouts", label: "Workouts", icon: Dumbbell },
      { href: "/cookbook", label: "Cookbook", icon: BookOpenText },
      { href: "/profile", label: "Profile", icon: User },
      { href: "/set", label: "Set", icon: Settings },
      { href: "/trainer", label: "Trainer Dashboard", icon: Settings },
      { href: "/client", label: "Find a trainer", icon: Settings },
    ];

  // Inside SidebarContent function within Sidebar.tsx
  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col justify-between overflow-y-auto px-4 py-6 text-[#8C8C8C] scrollbar-hide bg-[#F9F9F7]">
      <div>
        {/* Header / Logo */}
        <div className="mb-10 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            {/* Logo Box - Match your profile's green accent */}
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#2D4A22] shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xl font-bold tracking-tight text-[#2D4A22]"
                >
                  ReLive
                </motion.span>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#8C8C8C]">
                  The Botanical Archivist
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <SidebarItem
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              isActive={currentPath.startsWith(link.href)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="mt-8">
        <div className="h-px w-full bg-[#DDE1DF]/40 mb-6" />
        <SidebarItem
          href="/auth/logout"
          label="Log Out"
          icon={LogOut}
          isActive={false}
          isCollapsed={isCollapsed}
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Trigger */}
      <button
        className="fixed top-4 left-4 z-50 flex lg:hidden items-center justify-center rounded-xl bg-zinc-900/80 p-3 backdrop-blur-xl border border-white/10 text-white shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-transform active:scale-95"
        onClick={toggleMobile}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobile}
              className="fixed inset-0 z-40 bg-black/10 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              // Exact match background and border
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-[#DDE1DF]/40 bg-[#F7F9F7] lg:hidden"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: isCollapsed ? 88 : 280 }}
        transition={{ type: "spring", stiffness: 250, damping: 25 }}
        // Match the profile card background exactly
        className="hidden lg:flex h-screen flex-col border-r border-[#DDE1DF]/40 bg-[#F7F9F7] relative z-40 will-change-[width]"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
