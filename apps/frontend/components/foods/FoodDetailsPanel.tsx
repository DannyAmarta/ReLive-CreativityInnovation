"use client";

import { useEffect, useState } from "react";
import { Scale, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateNutrientsForServing, formatNutrientValue, withServingSize } from "@/lib/food";
import type { Food } from "@/types/food";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type FoodDetailsPanelProps = {
  food: Food | null;
  defaultServingSize: number;
  onAddToMeal: (food: Food) => void;
};

export function FoodDetailsPanel({ food, defaultServingSize, onAddToMeal }: FoodDetailsPanelProps) {
  const [servingSize, setServingSize] = useState(defaultServingSize);

  useEffect(() => { setServingSize(defaultServingSize); }, [defaultServingSize, food?.id]);

  if (!food) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-[#FFB7C5]/40 bg-[#FFF5F8]/50 px-6 py-16 text-center">
        <div className="mb-4 text-5xl">🌸</div>
        <h3 className="text-xl font-bold text-[#2d1520]" style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
          Select a food
        </h3>
        <p className="mt-2 text-sm text-[#6b3550]/60" style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}>
          Tap a result card to inspect its full nutrition profile here.
        </p>
      </div>
    );
  }

  const nutrients = calculateNutrientsForServing(food.per100gNutrients, servingSize);
  const mealReadyFood = withServingSize(food, servingSize);

  // Macro bar fractions (of 100g)
  const total = (nutrients.proteinGrams ?? 0) + (nutrients.carbsGrams ?? 0) + (nutrients.fatGrams ?? 0);
  const pct = (v: number | null) => total > 0 ? Math.round(((v ?? 0) / total) * 100) : 0;

  return (
    <motion.div layout className="space-y-4">
      {/* Header block */}
      <div className="rounded-[2rem] border border-white/60 bg-white/60 p-5 shadow-[0_8px_40px_rgba(180,60,100,0.1)] backdrop-blur-2xl">
        <span className="inline-flex rounded-full border border-[#FFB7C5]/60 bg-[#FFF0F5]/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B2C5A]">
          Food Inspector
        </span>
        <h2 className="mt-3 text-2xl font-bold leading-snug text-[#1a0a12]"
          style={{ fontFamily: "'Sora', var(--font-geist-sans)" }}>
          {food.name}
        </h2>
        <p className="mt-1 text-sm text-[#6b3550]/60" style={{ fontFamily: "'Nunito', var(--font-geist-sans)" }}>
          {food.brand || food.description || "Standardized nutrition profile"}
        </p>

        {/* Source badge */}
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#2d1520]/85 px-3.5 py-1.5 text-xs text-[#FFB7C5]/80 backdrop-blur-sm">
          <span className="font-bold text-white">{food.source}</span>
          {food.referenceServingSize && food.referenceServingUnit && (
            <span>· {food.referenceServingSize}{food.referenceServingUnit}</span>
          )}
        </div>
      </div>

      {/* Calorie spotlight + serving control */}
      <div className="rounded-[2rem] border border-[#FFB7C5]/30 bg-gradient-to-br from-[#FFF0F5]/90 to-[#FFE4EE]/70 p-5 backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Serving input */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B2C5A]/60">Serving size</p>
            <div className="mt-2 flex items-center gap-2 rounded-[1rem] border border-[#FFB7C5]/50 bg-white/80 px-4 py-2.5">
              <Scale className="h-4 w-4 text-[#C94F7E]" />
              <Input
                aria-label={`Serving size for ${food.name}`}
                type="number" min={1} max={5000}
                value={servingSize}
                onChange={(e) => setServingSize(Math.max(1, Math.trunc(Number(e.target.value) || 100)))}
                className="h-auto w-20 border-0 bg-transparent px-0 py-0 text-lg font-bold text-[#1a0a12] shadow-none ring-0 focus-visible:ring-0"
              />
              <span className="text-sm text-[#6b3550]/50">g</span>
            </div>
          </div>

          {/* Animated calorie display */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${servingSize}-${food.id}`}
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.82, opacity: 0 }}
              transition={{ type: "spring", stiffness: 340, damping: 28 }}
              className="rounded-[1.4rem] bg-gradient-to-br from-[#C94F7E] to-[#7B1C44] px-6 py-4 text-white shadow-[0_12px_40px_rgba(180,50,100,0.45)]"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Calories</p>
              <p className="mt-0.5 text-4xl font-black tabular-nums leading-none">
                {formatNutrientValue(nutrients.calories)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <Button
          onClick={() => onAddToMeal(mealReadyFood)}
          className="mt-4 w-full rounded-full bg-[#1a0a12] py-5 text-base font-bold text-white hover:bg-[#2d1520]"
          aria-label={`Add ${food.name} with ${servingSize}g to meal`}
        >
          <Plus className="mr-2 h-4 w-4" /> Add to meal tray
        </Button>
      </div>

      {/* Macro breakdown with animated bars */}
      <div className="rounded-[2rem] border border-white/60 bg-white/55 p-5 backdrop-blur-xl">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#9B2C5A]/60">Macros</p>
        <div className="grid grid-cols-2 gap-3">
          <MacroRing label="Protein" value={nutrients.proteinGrams} baseline={food.per100gNutrients.proteinGrams} pct={pct(nutrients.proteinGrams)} color="#C94F7E" track="#FFE4EE" />
          <MacroRing label="Carbs" value={nutrients.carbsGrams} baseline={food.per100gNutrients.carbsGrams} pct={pct(nutrients.carbsGrams)} color="#9B2C5A" track="#FFD6E7" />
          <MacroRing label="Fat" value={nutrients.fatGrams} baseline={food.per100gNutrients.fatGrams} pct={pct(nutrients.fatGrams)} color="#7B1C44" track="#F9D8EE" />
          <MacroRing label="Fiber" value={nutrients.fiberGrams} baseline={food.per100gNutrients.fiberGrams} pct={pct(nutrients.fiberGrams)} color="#5C2C9B" track="#EDE8FF" />
        </div>
      </div>

      {/* Mini extras */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Sugar" value={`${formatNutrientValue(nutrients.sugarGrams)}g`} />
        <MiniStat label="Sodium" value={`${formatNutrientValue(nutrients.sodiumMilligrams)}mg`} />
        <MiniStat label="Per 100g" value={`${formatNutrientValue(food.per100gNutrients.calories)} kcal`} />
      </div>
    </motion.div>
  );
}

const CIRCUMFERENCE = 2 * Math.PI * 28; // radius = 28

// function MacroRing({
//   label, value, baseline, pct, color, track,
// }: {
//   label: string; value: number | null; baseline: number | null; pct: number; color: string; track: string;
// }) {
//   const capped = Math.min(pct, 100);
//   const dashOffset = CIRCUMFERENCE - (CIRCUMFERENCE * capped) / 100;

//   return (
//     <div className="flex items-center gap-3 rounded-[1.4rem] border border-white/60 bg-white/60 p-4 backdrop-blur-sm">
//       {/* SVG ring */}
//       <div className="relative h-16 w-16 shrink-0">
//         <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
//           <circle cx="32" cy="32" r="28" fill="none" stroke={track} strokeWidth="5" />
//           <motion.circle
//             cx="32" cy="32" r="28"
//             fill="none"
//             stroke={color}
//             strokeWidth="5"
//             strokeLinecap="round"
//             strokeDasharray={CIRCUMFERENCE}
//             initial={{ strokeDashoffset: CIRCUMFERENCE }}
//             animate={{ strokeDashoffset: dashOffset }}
//             transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
//           />
//         </svg>
//         <div className="absolute inset-0 flex items-center justify-center">
//           <span className="text-xs font-black tabular-nums" style={{ color }}>{capped}%</span>
//         </div>
//       </div>
//       <div>
//         <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9B2C5A]/50">{label}</p>
//         <p className="mt-1 text-lg font-black text-[#1a0a12]">
//           {formatNutrientValue(value)}<span className="ml-0.5 text-sm font-medium text-[#6b3550]/50">g</span>
//         </p>
//         <p className="text-[10px] text-[#9B2C5A]/40">{formatNutrientValue(baseline)}g / 100g</p>
//       </div>
//     </div>
//   );
// }

function MacroRing({
  label, value, baseline, pct, color, track,
}: {
  label: string; value: number | null; baseline: number | null; pct: number; color: string; track: string;
}) {
  const capped = Math.min(pct, 100);

  return (
    <div className="flex flex-col justify-center rounded-[1.4rem] border border-white/60 bg-white/60 p-4 backdrop-blur-sm">
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#9B2C5A]/50">{label}</p>
          <p className="text-lg font-black text-[#1a0a12] leading-none mt-1">
            {formatNutrientValue(value)}<span className="text-sm font-medium text-[#6b3550]/50">g</span>
          </p>
        </div>
        <span className="text-xs font-black tabular-nums" style={{ color }}>{capped}%</span>
      </div>
      
      {/* Sleek Linear Progress Bar */}
      <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: track }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${capped}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <p className="mt-2 text-[10px] text-[#9B2C5A]/40 text-right">{formatNutrientValue(baseline)}g / 100g base</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-[#FFB7C5]/25 bg-white/50 p-3 text-center backdrop-blur-sm">
      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#9B2C5A]/50">{label}</p>
      <p className="mt-1.5 text-sm font-bold text-[#1a0a12]">{value}</p>
    </div>
  );
}
