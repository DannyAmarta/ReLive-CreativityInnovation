import { motion } from "framer-motion";
import { Award, Sprout, TreePine, Leaf, Sun, CloudRain, type LucideIcon } from "lucide-react";

interface Badge {
  id: string;
  name: string;
  icon: LucideIcon;
  unlocked: boolean;
}

const BADGES: Badge[] = [
  { id: "1", name: "First Leaf", icon: Award, unlocked: true },
  { id: "2", name: "In Bloom", icon: Sprout, unlocked: true },
  { id: "3", name: "Evergreen", icon: TreePine, unlocked: true },
  { id: "4", name: "Deep Roots", icon: Leaf, unlocked: false },
  { id: "5", name: "Solar Powered", icon: Sun, unlocked: false },
  { id: "6", name: "Resilient", icon: CloudRain, unlocked: false },
];

export function ProfileAchievements() {
  return (
    <div className="relative overflow-hidden flex flex-col p-8 rounded-3xl w-full bg-[#F7F9F7] border border-[#DDE1DF]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      
      {/* Background Decorative Circle (The large light orb on the right) */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#E8EBE9]/50 blur-3xl pointer-events-none" />
      <div className="absolute -right-4 top-4 h-48 w-48 rounded-full bg-[#DDE1DF]/30 border border-white/20 backdrop-blur-sm pointer-events-none z-0" />

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between mb-10">
        <div>
          <h3 className="text-[#2D5A27] font-bold text-lg">Botanical Achievements</h3>
          <p className="text-xs text-[#2C2E2C]/40 mt-1">Milestones in your wellness archive</p>
        </div>
        <button className="rounded-full bg-[#153011] px-5 py-2 text-xs font-bold text-white hover:bg-[#2D5A27] transition-all shadow-md">
          View All Badges
        </button>
      </div>

      {/* Badges Grid */}
      <div className="relative z-10 flex justify-between items-center gap-4">
        {BADGES.map((badge) => (
          <div key={badge.id} className="flex flex-col items-center gap-3 group">
            {/* Badge Icon Container */}
            <motion.div
              whileHover={badge.unlocked ? { y: -5, scale: 1.05 } : {}}
              className={`flex h-16 w-16 items-center justify-center rounded-full shadow-sm transition-all duration-500 ${
                badge.unlocked 
                  ? "bg-white border border-[#DDE1DF] text-[#2D5A27]" 
                  : "bg-[#E8EBE9]/50 text-[#2C2E2C]/20 grayscale border border-transparent"
              }`}
            >
              <badge.icon size={24} strokeWidth={badge.unlocked ? 2.5 : 1.5} />
            </motion.div>

            {/* Badge Label */}
            <span className={`text-[10px] font-bold uppercase tracking-[0.15em] text-center whitespace-nowrap transition-colors ${
              badge.unlocked ? "text-[#2C2E2C]/60" : "text-[#2C2E2C]/20"
            }`}>
              {badge.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
