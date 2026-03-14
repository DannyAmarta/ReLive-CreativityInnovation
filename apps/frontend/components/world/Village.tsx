"use client";

import { motion } from "framer-motion";

interface VillageItemProps {
  x: number;
  y: number;
  label: string;
  onClick: (x: number, y: number) => void;
  children: React.ReactNode;
}

function VillageItem({ x, y, label, onClick, children }: VillageItemProps) {
  return (
    <motion.div
      className="absolute cursor-pointer flex flex-col items-center"
      style={{ left: x, top: y }}
      whileHover={{ scale: 1.1, y: y - 10 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(x, y)}
      initial={{ opacity: 0, y: y + 20 }}
      animate={{ opacity: 1, y: y }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative group">
        {children}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {label}
        </div>
      </div>
    </motion.div>
  );
}

interface VillageProps {
  onItemClick: (x: number, y: number) => void;
}

export function Village({ onItemClick }: VillageProps) {
  return (
    <div className="relative w-full h-full">
      {/* Background/Landscape would ideally be a large SVG or high-res image */}
      {/* For now, we simulate the layout with positioned elements */}

      {/* House 1 - Left */}
      <VillageItem x={600} y={700} label="Community Center" onClick={onItemClick}>
        <div className="w-48 h-48 bg-[#d2b48c] rounded-lg border-4 border-[#8b4513] shadow-xl flex items-center justify-center relative">
            <div className="absolute -top-10 left-0 right-0 h-12 bg-[#8b4513] rounded-t-full"></div>
            <span className="text-4xl">🏠</span>
        </div>
      </VillageItem>

      {/* House 2 - Left */}
      <VillageItem x={850} y={800} label="Market" onClick={onItemClick}>
         <div className="w-40 h-40 bg-[#deb887] rounded-lg border-4 border-[#a0522d] shadow-xl flex items-center justify-center relative">
            <div className="absolute -top-8 left-0 right-0 h-10 bg-[#a0522d] rounded-t-full"></div>
            <span className="text-4xl">🛒</span>
        </div>
      </VillageItem>

      {/* Bridge */}
      <VillageItem x={1400} y={900} label="The Crossing" onClick={onItemClick}>
         <div className="w-64 h-24 bg-[#DEB887] rotate-12 rounded-full border-b-8 border-[#8B4513] shadow-lg flex items-center justify-center">
            <span className="text-2xl font-bold text-[#8B4513]">BRIDGE</span>
         </div>
      </VillageItem>

      {/* House 3 - Right */}
      <VillageItem x={1800} y={750} label="Library" onClick={onItemClick}>
        <div className="w-52 h-52 bg-[#f5deb3] rounded-lg border-4 border-[#5d4037] shadow-xl flex items-center justify-center relative">
            <div className="absolute -top-12 left-0 right-0 h-14 bg-[#5d4037] rounded-t-full"></div>
            <span className="text-4xl">📚</span>
        </div>
      </VillageItem>

      {/* River Simulation */}
      <motion.div 
        className="absolute top-[850px] left-[400px] w-[2200px] h-[300px] bg-blue-400/30 blur-3xl -z-10 rounded-full"
        animate={{
            scale: [1, 1.05, 1],
            x: [0, 50, 0]
        }}
        transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
        }}
      />
    </div>
  );
}
