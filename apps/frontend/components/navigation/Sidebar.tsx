"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SidebarItem } from "./SidebarItem";
import {
  Globe2,
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
    { href: "/cookbook", label: "Cookbook", icon: BookOpenText },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/set", label: "Settings", icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex h-full w-full flex-col justify-between overflow-y-auto px-4 py-6 text-zinc-300 scrollbar-hide">
      <div>
        {/* Header / Logo */}
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.4)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-gradient-to-r from-gray-100 to-gray-400 bg-clip-text text-xl font-bold tracking-tight text-transparent"
              >
                ReLive
              </motion.span>
            )}
          </div>
          {/* Desktop Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors flex-shrink-0"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
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
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
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
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-[280px] border-r border-white/10 bg-zinc-950/80 backdrop-blur-3xl lg:hidden shadow-[20px_0_40px_rgba(0,0,0,0.8)]"
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
        className="hidden lg:flex h-screen flex-col border-r border-white/10 bg-zinc-950/80 backdrop-blur-3xl relative z-40 shadow-[10px_0_30px_rgba(0,0,0,0.5)] will-change-[width]"
      >
        <SidebarContent />
      </motion.aside>
    </>
  );
}
