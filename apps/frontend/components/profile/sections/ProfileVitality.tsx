import { motion } from "framer-motion";

interface ProfileVitalityProps {
  percentage: number;
  label?: string;
  activitiesCount: number;
}

export function ProfileVitality({ 
  percentage = 75, 
  label = "Vitality", 
  activitiesCount = 6 
}: ProfileVitalityProps) {
  // SVG Path math
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-between p-8 rounded-3xl w-full max-w-[320px] aspect-[4/5] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#DDE1DF]/60 bg-[#F7F9F7]"
    >
      {/* Header */}
      <h3 className="text-[#2D5A27] font-bold text-sm self-start mb-4">
        Daily Energy Archive
      </h3>

      {/* Progress Circle Container */}
      <div className="relative flex items-center justify-center">
        <svg width="180" height="180" className="rotate-[-90deg]">
          {/* Background Circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#E8EBE9"
            strokeWidth="18"
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Progress Circle */}
          <motion.circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#2D5A27"
            strokeWidth="18"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-bold text-[#2C2E2C] leading-none">
            {percentage}%
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2C2E2C]/50 mt-1">
            {label}
          </span>
        </div>
      </div>

      {/* Footer Text */}
      <div className="mt-6 text-center">
        <p className="text-xs text-[#2C2E2C]/60 leading-relaxed">
          You've logged <span className="font-bold text-[#2C2E2C]">{activitiesCount} activities</span> this week.{" "}
          <span className="text-[#2D5A27] font-bold">Keep growing.</span>
        </p>
      </div>
    </motion.div>
  );
}