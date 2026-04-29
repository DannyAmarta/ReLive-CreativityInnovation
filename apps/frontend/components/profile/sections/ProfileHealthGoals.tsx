import { motion } from "framer-motion";
import { ArrowRight, Weight, Droplets, Move, type LucideIcon } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  target: string;
  progress: number; // 0 to 100
  icon: LucideIcon;
}

const DEFAULT_GOALS: Goal[] = [
  { id: "1", title: "Target Weight", target: "68kg", progress: 85, icon: Weight },
  { id: "2", title: "Daily Hydration", target: "3L", progress: 40, icon: Droplets },
  { id: "3", title: "Mindful Minutes", target: "15min", progress: 100, icon: Move },
];

export function ProfileHealthGoals() {
  return (
    <div className="flex flex-col p-8 rounded-3xl w-full h-full bg-[#F7F9F7] border border-[#DDE1DF]/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-[#2D5A27] font-bold text-lg">Current Health Goals</h3>
        <button className="flex items-center gap-1.5 text-[#2D5A27] text-xs font-bold hover:opacity-70 transition-opacity">
          View Archive <ArrowRight size={14} />
        </button>
      </div>

      {/* Goals List */}
      <div className="space-y-8">
        {DEFAULT_GOALS.map((goal) => (
          <div key={goal.id} className="flex items-start gap-4">
            {/* Circular Icon Backdrop */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#C5E1A5]/40 text-[#2D5A27]">
              <goal.icon size={20} strokeWidth={2.5} />
            </div>

            {/* Content Area */}
            <div className="flex-grow pt-1">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-[#2C2E2C]">
                  {goal.title}: {goal.target}
                </span>
                <span className="text-[10px] font-bold text-[#2C2E2C]/40 uppercase tracking-wider">
                  {goal.progress}% Complete
                </span>
              </div>

              {/* Custom Progress Bar */}
              <div className="relative h-2 w-full rounded-full bg-[#E8EBE9] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full rounded-full bg-[#2D5A27]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}