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
        whileTap={{ scale: 0.98 }}
        className={cn(
          "flex items-center rounded-2xl p-4 mb-2 cursor-pointer transition-all duration-300 relative group",
          isActive
            ? "text-[#2D4A22] font-bold" // Deep Botanical Green
            : "text-[#8C8C8C] hover:text-[#2D4A22]"
        )}
      >
        {/* The Active Background (Pill) */}
        {isActive && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 rounded-2xl bg-white shadow-sm"
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
        )}

        <div className="flex items-center justify-center relative z-10">
          <Icon className={cn("h-5 w-5 transition-colors", 
            isActive ? "text-[#2D4A22]" : "text-[#8C8C8C] group-hover:text-[#2D4A22]")} 
          />
        </div>
        
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ml-4 uppercase tracking-[0.15em] text-xs font-bold z-10"
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </Link>
  );
};