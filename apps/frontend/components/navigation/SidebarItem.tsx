"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive: boolean;
  isCollapsed: boolean;
}

export const SidebarItem = ({
  icon: Icon,
  label,
  href,
  isActive,
  isCollapsed,
}: SidebarItemProps) => {
  return (
    <Link href={href} className="w-full">
      <motion.div
        whileHover={{ scale: 0.98 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "flex items-center rounded-xl p-3 mb-1 cursor-pointer transition-colors duration-200 relative",
          isActive
            ? "bg-white/10 text-white font-medium"
            : "text-zinc-400 hover:bg-white/5 hover:text-white"
        )}
      >
        <div className="flex items-center justify-center relative z-10">
          <Icon className={cn("h-5 w-5", isActive ? "text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" : "")} />
        </div>
        
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="ml-3 truncate whitespace-nowrap z-10"
          >
            {label}
          </motion.span>
        )}
        
        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 rounded-xl border border-white/20 bg-white/[0.03] shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </motion.div>
    </Link>
  );
};
