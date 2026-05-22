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

    const springX = useSpring(mouseX, { stiffness: 200, damping: 30 });
    const springY = useSpring(mouseY, { stiffness: 200, damping: 30 });

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

    return (
        <motion.div
            ref={cardRef}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            style={{ rotateX, rotateY, transformPerspective: 800 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "group relative h-full cursor-default overflow-hidden rounded-[1.8rem] transition-all duration-300",
                isSelected
                    ? "border-2 border-[#7CB342] shadow-[0_20px_40px_-12px_rgba(100,150,70,0.35)] ring-4 ring-[#7CB342]/20"
                    : "border border-[#e2f0da] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_-12px_rgba(60,100,45,0.2)]",
            )}
        >
            {/* Clean solid background – no blur, high contrast */}
            <div className="absolute inset-0 bg-white rounded-[1.8rem]" />

            {/* Subtle green gradient accent on bottom */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f1f9eb] to-transparent rounded-b-[1.8rem] pointer-events-none" />

            {/* Cursor spotlight – soft green glow */}
            <motion.div
                className="pointer-events-none absolute inset-0 rounded-[1.8rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background: useTransform([springX, springY], () => {
                        const x = (springX.get() + 0.5) * 100;
                        const y = (springY.get() + 0.5) * 100;
                        return `radial-gradient(280px circle at ${x}% ${y}%, rgba(124,179,66,0.12), transparent 70%)`;
                    }),
                }}
            />

            {/* Selected left-edge stripe */}
            {isSelected && (
                <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full bg-gradient-to-b from-[#8BC34A] to-[#558B2F]" />
            )}

            <div className="relative z-10 p-5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3
                                className="text-xl font-bold leading-tight text-[#1C2E14] tracking-tight"
                                style={{
                                    fontFamily:
                                        "'Sora', var(--font-geist-sans)",
                                }}
                            >
                                {food.name}
                            </h3>
                            <span className="rounded-full bg-[#e8f5e3] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#3A6B2F] border border-[#c5e0b4]">
                                {food.source}
                            </span>
                        </div>
                        {(food.brand || food.description) && (
                            <p
                                className="mt-1 text-sm text-[#5A6E52] line-clamp-1"
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
                                "rounded-full p-1.5 transition-all",
                                isFavorite
                                    ? "bg-[#DCEDC8] text-[#558B2F]"
                                    : "bg-[#F5F5F5] text-[#9E9E9E] hover:text-[#7CB342] hover:bg-[#EDF7E7]",
                            )}
                        >
                            <Heart
                                className={cn(
                                    "h-4 w-4",
                                    isFavorite && "fill-current",
                                )}
                            />
                        </motion.button>

                        <div className="rounded-2xl bg-gradient-to-br from-[#3E6B2F] to-[#2C4E1E] px-3 py-2.5 text-white shadow-md">
                            <div className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-white/70">
                                <Flame className="h-3 w-3" /> kcal
                            </div>
                            <p className="mt-0.5 text-xl font-black tabular-nums">
                                {formatNutrientValue(food.nutrients.calories)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Macro strip – now with better contrast */}
                <div className="mt-4 grid grid-cols-4 gap-2">
                    <MacroStat
                        label="Protein"
                        value={food.nutrients.proteinGrams}
                        color="protein"
                    />
                    <MacroStat
                        label="Carbs"
                        value={food.nutrients.carbsGrams}
                        color="carbs"
                    />
                    <MacroStat
                        label="Fat"
                        value={food.nutrients.fatGrams}
                        color="fat"
                    />
                    <MacroStat
                        label="Fiber"
                        value={food.nutrients.fiberGrams}
                        color="fiber"
                    />
                </div>

                {/* Footer actions */}
                <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-[#DAE8D4] bg-[#F9FCF7] px-4 py-3 text-[#2C3A24] shadow-sm">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#7B8F6E]">
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
                            className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#3E6B2F] shadow-sm border border-[#cde2c0] hover:bg-[#f0f8ea] transition"
                        >
                            <Plus className="h-3.5 w-3.5" /> Meal
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => onSelect(food)}
                            className={cn(
                                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition shadow-sm",
                                isSelected
                                    ? "bg-[#E8F0E3] text-[#3E6B2F] border border-[#bcdd9c]"
                                    : "bg-gradient-to-r from-[#7CB342] to-[#558B2F] text-white shadow-md hover:shadow-lg",
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
})

// Distinct, readable macro stat colors
const macroColors = {
    protein: "bg-[#E9F3E3] text-[#2C5A1E]",
    carbs: "bg-[#F1F8E9] text-[#3A6B2F]",
    fat: "bg-[#ECF7E4] text-[#2E5E20]",
    fiber: "bg-[#F4FBF0] text-[#3D7230]",
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
                "rounded-2xl p-3 shadow-sm border border-white/40",
                macroColors[color],
            )}
        >
            <p className="text-[9px] font-bold uppercase tracking-wider opacity-70">
                {label}
            </p>
            <p className="mt-1.5 text-base font-bold tabular-nums leading-none text-[#1C2E14]">
                {formatNutrientValue(value)}
                <span className="ml-0.5 text-[10px] font-medium opacity-60">
                    g
                </span>
            </p>
        </div>
    );
}