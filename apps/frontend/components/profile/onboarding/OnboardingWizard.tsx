"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sprout, Target, Activity, Check, X, Leaf, Sparkles, ArrowRight,
  Dumbbell, Zap, Scale, Brain, Moon, Footprints, Flame, TreePine,
  Armchair, Move, Bike
} from "lucide-react";

const STEPS = [
  {
    id: "primaryGoal",
    title: "Define Your Path",
    subtitle: "What is your primary focus this season?",
    options: [
      { label: "Strength Building", sub: "Build structure & power", value: "STRENGTH", icon: Dumbbell },
      { label: "Vitality Flow", sub: "Increase daily energy flow", value: "VITALITY", icon: Zap },
      { label: "Efficiency", sub: "Weight & macro management", value: "EFFICIENCY", icon: Scale },
      { label: "Mindful Minutes", sub: "Mental clarity & focus", value: "MINDFULNESS", icon: Brain },
    ],
  },
  {
    id: "fitnessLevel",
    title: "Rate Your Growth Stage",
    subtitle: "Describe your current movement frequency.",
    options: [
      { label: "Dormant", sub: "Minimal physical activity", value: "DORMANT", icon: Moon },
      { label: "Sprouting", sub: "Moving 1-2 days / week", value: "SPROUTING", icon: Sprout },
      { label: "Growing Sapling", sub: "Active 3-4 days / week", value: "GROWING", icon: Flame },
      { label: "Evergreen", sub: "Active 5+ days / week", value: "EVERGREEN", icon: TreePine },
    ],
  },
  {
    id: "dailyActivity",
    title: "Describe Your Environment",
    subtitle: "What is your typical daily 'Stance'?",
    options: [
      { label: "Rooted", sub: "Mostly sitting at a desk", value: "ROOTED", icon: Armchair },
      { label: "Shifting", sub: "Moderate walking", value: "SHIFTING", icon: Footprints },
      { label: "Aerial", sub: "Highly active/physical work", value: "AERIAL", icon: Bike },
    ],
  },
];

interface OnboardingWizardProps {
  userName: string;
  onFinalize: (data: any) => void;
  isLoading: boolean;
  serverError: string | null;
}

export function OnboardingWizard({ 
  userName, 
  onFinalize, 
  isLoading, 
  serverError 
}: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Record<string, string>>({});

  const handleSelect = (stepId: string, value: string) => {
    setData((prev) => ({ ...prev, [stepId]: value }));
  };

  const current = STEPS[step];
  const selectedValue = data[current.id];

  // Calculate the fill percentage: (current step + 1) / total steps
  const progressPercent = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-white overflow-y-auto">
      {/* ── Header ── */}
      <nav className="flex items-center justify-between p-6 sm:px-12 border-b border-[#DDE1DF]/40">
        <div className="flex items-center gap-2">
          <Leaf className="h-5 w-5 text-[#2D5A27]" />
          <span className="font-semibold text-sm text-[#2C2E2C]">ReLive</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#2C2E2C]/40 font-medium">Step {step + 1} of {STEPS.length}</span>
          <button className="text-[#2C2E2C]/30 hover:text-[#2C2E2C]/70"><X size={18} /></button>
        </div>
      </nav>

      {/* ── Main Content Area ── */}
      <main className="flex-grow flex items-center justify-center py-16 px-6">
        <div className="w-full max-w-4xl">
          
          {/* Section Title Block with Progress Bar */}
          <div className="relative mb-12 pb-6 border-b border-[#DDE1DF]/50 flex flex-col">
            {/* Background Track (The light gray line) */}
            <div className="absolute top-0 left-0 h-[2px] w-full bg-[#DDE1DF]/30" />

            {/* Animated Progress Bar (The Green Bar) - Untouched */}
            <motion.div 
            className="absolute top-0 left-0 h-[6px] bg-[#2D5A27] z-10 rounded-lg"
            initial={{ width: "0%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 40, damping: 15 }}
            />
            {/* Flex wrapper to align h1 and p center to each other */}
            <div className="flex items-baseline justify-between mt-6">
                <h1 
                    className="text-4xl font-bold text-[#2D5A27]" 
                    style={{ fontFamily: "'Sora', sans-serif" }}
                >
                    {current.title}
                </h1>
                
                {/* Removed 'absolute' and 'top-8' to allow flex alignment */}
                <p className="text-xs text-[#2C2E2C]/40 font-medium italic">
                    Curating your wellness archive
                </p>
            </div>
        </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-10">
                 <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#2D5A27] mb-2">Inquiry {step+1}</p>
                 <h2 className="text-2xl font-bold text-[#2C2E2C]">
                  {step === 0 ? `Welcome, ${userName}. ${current.subtitle}` : current.subtitle}
                </h2>
              </div>

             {/* Grid Layout (Options) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {current.options.map((opt) => (
                <button
                key={opt.value}
                onClick={() => handleSelect(current.id, opt.value)}
                className={`relative overflow-hidden flex flex-col p-8 rounded-3xl border transition-all duration-300 group text-left ${
                    selectedValue === opt.value
                    ? "border-[#2D5A27] bg-[#2D5A27] text-white shadow-xl shadow-[#2D5A27]/20"
                    : "border-[#DDE1DF]/70 bg-[#F7F9F7] text-[#2C2E2C] hover:border-[#2D5A27]/50"
                }`}
                >
                {/* ── THE WATERMARK ICON ── */}
                {/* We hide it when selected to keep the white text perfectly clean */}
                {selectedValue !== opt.value && (
                    <div className="absolute bottom-[-15%] right-[-10%] pointer-events-none opacity-[0.08] group-hover:opacity-[0.12] transition-all duration-500 group-hover:scale-110 group-hover:-rotate-12">
                    <opt.icon 
                        size={180} // Make it huge!
                        strokeWidth={1} // Keep the lines thin and elegant
                        className="text-[#2D5A27]" 
                    />
                    </div>
                )}

                {/* ── CARD CONTENT ── */}
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                    <div className={`flex items-center justify-center h-12 w-12 rounded-full border transition-colors ${
                        selectedValue === opt.value
                        ? "bg-white/10 border-white/20"
                        : "bg-white border-[#DDE1DF] text-[#2D5A27]"
                    }`}>
                        <opt.icon size={20} strokeWidth={selectedValue === opt.value ? 2.5 : 2} />
                    </div>
                    
                    {selectedValue === opt.value && (
                        <div className="absolute top-6 right-6 flex h-6 w-6 items-center justify-center rounded-full bg-white text-[#2D5A27] shadow-lg">
                        <Check size={14} strokeWidth={3} />
                        </div>
                    )}
                    </div>

                    <p className={`font-bold text-lg mb-1 transition-colors ${
                    selectedValue === opt.value ? "text-white" : "text-[#2C2E2C]"
                    }`}>
                    {opt.label}
                    </p>
                    <p className={`text-sm transition-colors ${
                    selectedValue === opt.value ? "text-white/80" : "text-[#2C2E2C]/50"
                    }`}>
                    {opt.sub}
                    </p>
                </div>
                </button>
            ))}
            </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer ── */}
    <footer className="flex items-center justify-between p-6 sm:px-12 border-t border-[#DDE1DF]/40 mt-12 bg-white/80 backdrop-blur-md">
    <div className="flex items-center gap-6">
        {/* Only show Back if we aren't on the first step */}
        {step > 0 ? (
        <button
            onClick={() => setStep(step - 1)}
            disabled={isLoading}
            className="text-sm font-bold text-[#2C2E2C]/50 hover:text-[#2D5A27] transition-colors flex items-center gap-2 group disabled:opacity-30"
        >
            <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: -3 }}
            >
            <ArrowRight className="h-4 w-4 rotate-180" />
            </motion.div>
            Back
        </button>
        ) : (
        <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#2D5A27] opacity-60" />
            <p className="text-xs text-[#2C2E2C]/50 font-medium">Your path is being personalized in real-time.</p>
        </div>
        )}
    </div>

    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={!selectedValue || isLoading}
        onClick={() => {
        if (step < STEPS.length - 1) {
            setStep(step + 1);
        } else {
            onFinalize(data);
        }
        }}
        className="flex items-center gap-2.5 rounded-2xl bg-[#071407] px-8 py-3.5 text-sm font-bold text-white transition-all shadow-xl hover:bg-[#153011] disabled:opacity-30 disabled:cursor-not-allowed"
    >
        {isLoading ? "Planting Seeds..." : (step < STEPS.length - 1 ? "Continue" : "Finalize Soil Analysis")}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
    </motion.button>
    </footer>
    </div>
  );
}
