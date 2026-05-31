"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const FEATURES = [
  { tag: "Authentication", title: "Argon2 + Google OAuth", body: "Email-activated accounts, single-use handoff codes, and JWT-synced HTTP-only sessions." },
  { tag: "3D World", title: "/world as the hub", body: "A fantasy map of hotspots — Nutrition, Astral Profile, Workout Workshop — rendered with R3F + Babylon." },
  { tag: "Nutrition", title: "USDA → OFF fallback", body: "Debounced search, cached normalization, and per-100g math recalculated client-side per serving." },
  { tag: "Cookbook", title: "Parchment recipes", body: "Spoonacular with TheMealDB fallback. Click any ingredient to jump straight into /foods." },
  { tag: "Training", title: "Brzycki · Wathan · Cardio", body: "Strategy-routed 1RM math, CNS-fatigue flags, and a Qwen coach clamped by a safety envelope." },
  { tag: "Escrow", title: "IDR & USDC on Solana", body: "Fiat via Duitku webhooks. Crypto via on-chain indexer with browser-signed releases." },
];

export default function HorizontalCards() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref });
  // pin section: translate the row from 0 to -(N-1)/N * 100% of its width
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

  return (
    <section ref={ref} className="relative h-[500vh] bg-[#06060d] text-white">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        <div className="pt-16 px-8 md:px-16 flex items-end justify-between">
          <h2 className="text-3xl md:text-5xl font-serif font-light max-w-xl leading-tight">
            What lives <span className="italic text-white/50">inside</span> ReLive
          </h2>
          <p className="hidden md:block text-xs uppercase tracking-[0.3em] text-white/40">Scroll · drift right</p>
        </div>

        <div className="flex-1 flex items-center">
          <motion.div style={{ x }} className="flex gap-8 pl-8 md:pl-16 pr-[50vw] will-change-transform">
            {FEATURES.map((f, i) => (
              <article
                key={f.tag}
                className="shrink-0 w-[80vw] md:w-[42vw] lg:w-[34vw] h-[58vh] rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-10 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">{f.tag}</span>
                  <span className="text-xs text-white/40 font-mono">0{i + 1} / 0{FEATURES.length}</span>
                </div>
                <div>
                  <h3 className="text-3xl md:text-4xl font-serif font-light mb-5 leading-tight">{f.title}</h3>
                  <p className="text-white/65 text-base leading-relaxed max-w-sm">{f.body}</p>
                </div>
              </article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
