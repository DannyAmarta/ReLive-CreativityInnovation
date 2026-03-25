"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWorldStore } from "@/store/worldStore";

const MENU_ITEMS = [
  { id: "village", label: "Village", icon: "🗺️", color: "from-blue-500 to-indigo-500", action: "village" },
  { id: "profile", label: "Profile", icon: "🔮", color: "from-purple-500 to-fuchsia-500", action: "profile" },
  { id: "nutrition", label: "Nutrition Database", icon: "🥗", color: "from-emerald-500 to-teal-500", action: "route:/foods" },
  { id: "cookbook", label: "Macro Grimoire", icon: "📖", color: "from-amber-500 to-orange-500", action: "route:/cookbook" },
];

export function RadialMenu() {
  const router = useRouter();
  const { radialMenuOpen, setRadialMenuOpen, setShowProfile } = useWorldStore();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keybindings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key.toLowerCase() === "q" && !radialMenuOpen) {
        setRadialMenuOpen(true);
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key.toLowerCase() === "q") {
        setRadialMenuOpen(false);
        // Execute action based on hovered index if one is selected
        setHoveredIdx((currentHover) => {
          if (currentHover !== null) {
            const item = MENU_ITEMS[currentHover];
            if (item.action.startsWith("route:")) {
              router.push(item.action.replace("route:", ""));
            } else if (item.action === "profile") {
              setShowProfile(true);
            } else if (item.action === "village") {
              setShowProfile(false);
            }
          }
          return null;
        });
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [radialMenuOpen, setRadialMenuOpen, router, setShowProfile]);

  // Mouse angle calculation
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    
    // distance check to ignore center deadzone
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 40) {
      setHoveredIdx(null);
      return;
    }

    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    // Convert to 0-360 starting from top (-90 becomes 0)
    angle = (angle + 90 + 360) % 360; 

    // 4 items = 90 degrees per slice. Top is 0.
    // 0-45 & 315-360 = top (index 0)
    // 45-135 = right (index 1)
    // 135-225 = bottom (index 2)
    // 225-315 = left (index 3)
    if (angle > 315 || angle <= 45) setHoveredIdx(0);
    else if (angle > 45 && angle <= 135) setHoveredIdx(1);
    else if (angle > 135 && angle <= 225) setHoveredIdx(2);
    else if (angle > 225 && angle <= 315) setHoveredIdx(3);
  };

  return (
    <AnimatePresence>
      {radialMenuOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIdx(null)}
        >
          {/* Menu Ring Background */}
          <motion.div 
            initial={{ scale: 0.8, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.9, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative w-[340px] h-[340px] md:w-[400px] md:h-[400px] rounded-full border border-white/10 flex items-center justify-center pointer-events-none shadow-[0_0_100px_rgba(0,0,0,0.5)]"
          >
            {/* Guide slices (visual only) */}
            <div className="absolute inset-0 rounded-full border-[20px] border-white/5 pointer-events-none" />

            {/* Center Deco */}
            <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center bg-black/40">
               <div className="w-16 h-16 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
                 <span className="text-white/50 text-xs font-bold tracking-widest leading-tight text-center">
                   {hoveredIdx !== null ? "RELEASE" : "HOLD Q"}
                 </span>
               </div>
            </div>

            {/* Menu Items */}
            {MENU_ITEMS.map((item, i) => {
              // Position items on a circle
              const angleDeg = (i * 90) - 90; // Top is 0, Right 90, Bottom 180, Left 270
              const isHovered = hoveredIdx === i;

              return (
                <div
                  key={item.id}
                  className="absolute pointer-events-auto"
                  style={{
                    left: `calc(50% + ${Math.cos(angleDeg * (Math.PI / 180)) * 140}px)`,
                    top: `calc(50% + ${Math.sin(angleDeg * (Math.PI / 180)) * 140}px)`,
                    transform: "translate(-50%, -50%)"
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                >
                  <motion.div
                    animate={{ 
                      scale: isHovered ? 1.25 : 1, 
                      opacity: isHovered ? 1 : 0.6 
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative flex flex-col items-center justify-center"
                  >
                    <div 
                      className={`w-[72px] h-[72px] rounded-full flex items-center justify-center text-3xl shadow-xl transition-colors duration-300 ${
                        isHovered 
                          ? `bg-gradient-to-br ${item.color} border border-white shadow-[0_0_40px_rgba(255,255,255,0.4)]` 
                          : 'bg-white/10 border border-white/20 backdrop-blur-md'
                      }`}
                    >
                      {item.icon}
                    </div>
                    {isHovered && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute top-[85px] whitespace-nowrap bg-black/60 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 text-white font-bold tracking-wide shadow-2xl"
                      >
                        {item.label}
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
