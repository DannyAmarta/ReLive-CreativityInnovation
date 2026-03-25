"use client";

import { memo, useRef } from "react";
import { Heart, Info, Flame, Plus } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { formatNutrientValue } from "@/lib/food";
import { cn } from "@/lib/utils";
import type { Food } from "@/types/food";

type FoodCardProps = {
    food: Food;
    isSelected: boolean;
    isFavorite: boolean;
    onSelect: (food: Food) => void;
    onToggleFavorite: (food: Food) => void;
    onAddToMeal: (food: Food) => void;
};

// Remove useMotionValue, useSpring, and the mouse event handlers entirely.
// Keep the card simple and static until hovered.
export const FoodCard = memo(function FoodCard({
    food,
    isSelected,
    isFavorite,
    onSelect,
    onToggleFavorite,
    onAddToMeal,
}: FoodCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth spring for spotlight position
    const springX = useSpring(mouseX, { stiffness: 200, damping: 30 });
    const springY = useSpring(mouseY, { stiffness: 200, damping: 30 });

    // Subtle tilt effect
    const rotateX = useTransform(springY, [-0.5, 0.5], [2, -2]);
    const rotateY = useTransform(springX, [-0.5, 0.5], [-2, 2]);

    function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
        mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
    }

    function handleMouseLeave() {
        mouseX.set(0);
        mouseY.set(0);
    }

    // Spotlight coords (0→100% of card)
    const spotX = useTransform(springX, [-0.5, 0.5], ["10%", "90%"]);
    const spotY = useTransform(springY, [-0.5, 0.5], ["10%", "90%"]);

    return (
        // <motion.div
        //     ref={cardRef}
        //     layout
        //     initial={{ opacity: 0, scale: 0.95 }}
        //     animate={{ opacity: 1, scale: 1 }}
        //     exit={{ opacity: 0, scale: 0.93 }}
        //     style={{ rotateX, rotateY, transformPerspective: 800 }}
        //     onMouseMove={handleMouseMove}
        //     onMouseLeave={handleMouseLeave}
        //     className={cn(
        //         "group relative h-full cursor-default overflow-hidden rounded-[1.8rem] border transition-shadow duration-300",
        //         isSelected
        //             ? "border-[#E879A0]/70 shadow-[0_16px_60px_rgba(200,80,130,0.28)]"
        //             : "border-white/60 shadow-[0_4px_24px_rgba(180,60,100,0.07)] hover:shadow-[0_20px_60px_rgba(200,80,130,0.22)]",
        //     )}
        //     // style={{ rotateX, rotateY, transformPerspective: 800 } as React.CSSProperties}
        // >
        <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.01 }} // <-- Simple, clean hover interaction
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative h-full cursor-default overflow-hidden rounded-[1.8rem] border border-white/80 transition-all duration-400 backdrop-blur-2xl",
        isSelected
          ? "border-[#E879A0]/70 shadow-[0_16px_40px_rgba(200,80,130,0.15),inset_0_1px_1px_rgba(255,255,255,0.7)] ring-1 ring-[#E879A0]/50"
          : "shadow-[0_4px_24px_rgba(180,60,100,0.04),inset_0_1px_1px_rgba(255,255,255,0.5)] hover:shadow-[0_12px_32px_rgba(200,80,130,0.12),inset_0_1px_1px_rgba(255,255,255,0.8)] hover:border-white",
      )}
    >
            {/* Glassmorphism background */}
            <div
                className={cn(
                    "absolute inset-0 transition-opacity duration-300",
                    isSelected
                        ? "bg-[linear-gradient(135deg,rgba(255,240,248,0.7),rgba(255,255,255,0.6))]"
                        : "bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(255,240,248,0.3))]",
                )}
            />

            {/* Cursor spotlight — appears on hover */}
            <motion.div
                className="pointer-events-none absolute inset-0 rounded-[1.8rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: useTransform([springX, springY], () => {
                        const x = (springX.get() + 0.5) * 100;
                        const y = (springY.get() + 0.5) * 100;
                        return `radial-gradient(220px circle at ${x}% ${y}%, rgba(255,183,197,0.22), transparent 70%)`;
                    }),
                }}
            />

            {/* Selected left-edge stripe */}
            {isSelected && (
                <div className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r-full bg-gradient-to-b from-[#FFB7C5] to-[#C94F7E]" />
            )}

            <div className="relative z-10 p-5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 pl-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3
                                className="text-lg font-bold leading-snug text-[#1a0a12]"
                                style={{
                                    fontFamily:
                                        "'Sora', var(--font-geist-sans)",
                                }}
                            >
                                {food.name}
                            </h3>
                            <span className="rounded-full border border-[#FFB7C5]/50 bg-[#FFF0F5]/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#9B2C5A]">
                                {food.source}
                            </span>
                        </div>
                        {(food.brand || food.description) && (
                            <p
                                className="mt-1 text-sm text-[#6b3550]/60 line-clamp-1"
                                style={{
                                    fontFamily:
                                        "'Nunito', var(--font-geist-sans)",
                                }}
                            >
                                {food.brand || food.description}
                            </p>
                        )}
                    </div>

                    {/* Calorie badge + heart */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                        <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.85 }}
                            type="button"
                            onClick={() => onToggleFavorite(food)}
                            aria-label={
                                isFavorite ? "Remove favorite" : "Add favorite"
                            }
                            className={cn(
                                "rounded-full p-1.5 transition-colors",
                                isFavorite
                                    ? "bg-[#F9A8C0]/40 text-[#C94F7E]"
                                    : "bg-white/50 text-[#9B2C5A]/40 hover:text-[#C94F7E]",
                            )}
                        >
                            <Heart
                                className={cn(
                                    "h-4 w-4",
                                    isFavorite && "fill-current",
                                )}
                            />
                        </motion.button>

                        <div className="rounded-[1rem] bg-gradient-to-br from-[#C94F7E] to-[#7B1C44] px-3 py-2.5 text-white shadow-[0_8px_24px_rgba(180,50,100,0.45)]">
                            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/70">
                                <Flame className="h-3 w-3" /> kcal
                            </div>
                            <p className="mt-0.5 text-xl font-black tabular-nums">
                                {formatNutrientValue(food.nutrients.calories)}
                            </p>
                            <p className="text-[9px] text-white/60">
                                per {food.servingSize}g
                            </p>
                        </div>
                    </div>
                </div>

                {/* Macro strip */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                    <MacroStat
                        label="Protein"
                        value={food.nutrients.proteinGrams}
                        color="rose"
                    />
                    <MacroStat
                        label="Carbs"
                        value={food.nutrients.carbsGrams}
                        color="pink"
                    />
                    <MacroStat
                        label="Fat"
                        value={food.nutrients.fatGrams}
                        color="fuchsia"
                    />
                    <MacroStat
                        label="Fiber"
                        value={food.nutrients.fiberGrams}
                        color="purple"
                    />
                </div>

                {/* Footer actions */}
                <div className="mt-4 flex items-center justify-between gap-2 rounded-[1.2rem] border border-[#FFB7C5]/20 bg-[#1a0a12]/80 px-4 py-3 text-white backdrop-blur-sm">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[#FFB7C5]/60">
                        {food.referenceServingSize && food.referenceServingUnit
                            ? `Ref: ${food.referenceServingSize}${food.referenceServingUnit}`
                            : "100g base"}
                    </p>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => onAddToMeal(food)}
                            className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/20 transition"
                        >
                            <Plus className="h-3.5 w-3.5" /> Meal
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => onSelect(food)}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition",
                                isSelected
                                    ? "bg-white/15 text-white/70"
                                    : "bg-gradient-to-r from-[#FFB7C5] to-[#C94F7E] text-white shadow-[0_4px_14px_rgba(200,80,130,0.5)]",
                            )}
                        >
                            <Info className="h-3.5 w-3.5" />
                            {isSelected ? "Open" : "Inspect"}
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

const macroColors = {
    rose: "from-[#FFE4EC] to-[#FFD0DC] text-[#9B2C5A]",
    pink: "from-[#FFE8F4] to-[#FFD6E7] text-[#8B2A5A]",
    fuchsia: "from-[#F8E8FF] to-[#F0D4FC] text-[#7A2C8C]",
    purple: "from-[#EBE8FF] to-[#DDD4FC] text-[#5C2C9B]",
};

function MacroStat({
    label,
    value,
    color,
}: {
    label: string;
    value: number | null;
    color: keyof typeof macroColors;
}) {
    return (
        <div
            className={cn(
                "rounded-[1rem] bg-gradient-to-br p-3",
                macroColors[color],
            )}
        >
            <p className="text-[9px] font-bold uppercase tracking-[0.15em] opacity-60">
                {label}
            </p>
            <p className="mt-1.5 text-base font-bold tabular-nums leading-none">
                {formatNutrientValue(value)}
                <span className="ml-0.5 text-[10px] font-medium opacity-50">
                    g
                </span>
            </p>
        </div>
    );
}
