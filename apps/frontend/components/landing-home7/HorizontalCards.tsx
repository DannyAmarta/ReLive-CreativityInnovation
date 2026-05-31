"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import BlurHeading from "./BlurHeading";

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
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-80%"]);

  return (
    <section id="security" ref={ref} className="relative h-[500vh] bg-[#f6f1e7] text-[#233126]">
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col">
        <div className="pt-16 px-8 md:px-16 flex items-end justify-between">
          <BlurHeading as="h2" className="font-sora text-3xl md:text-5xl font-light max-w-xl leading-tight text-[#233126]">
            What lives <span className="italic text-[#8ba888]">inside</span> ReLive
          </BlurHeading>
          <p className="hidden md:block font-inter text-xs uppercase tracking-[0.3em] text-[#c77a5a]">Scroll · drift right</p>
        </div>

        <div className="flex-1 flex items-center">
          <motion.div style={{ x }} className="flex gap-8 pl-8 md:pl-16 pr-[50vw] will-change-transform">
            {FEATURES.map((f, i) => (
              <article
                key={f.tag}
                className="shrink-0 w-[80vw] md:w-[42vw] lg:w-[34vw] h-[58vh] rounded-3xl border border-[#2d5a27]/15 bg-white/70 backdrop-blur-xl p-10 flex flex-col justify-between shadow-[0_30px_70px_-40px_rgba(45,90,39,0.35)]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-inter text-xs uppercase tracking-[0.3em] text-[#2d5a27]">{f.tag}</span>
                  <span className="font-inter text-xs text-[#233126]/40 tabular-nums">0{i + 1} / 0{FEATURES.length}</span>
                </div>
                <div>
                  <h3 className="font-sora text-3xl md:text-4xl font-semibold mb-5 leading-tight text-[#2d5a27]">{f.title}</h3>
                  <p className="font-inter text-[#233126]/70 text-base leading-relaxed max-w-sm">{f.body}</p>
                </div>
              </article>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
