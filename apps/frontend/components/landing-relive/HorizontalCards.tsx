"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const CARDS = [
  {
    tag: "Auth",
    title: "Email handoff + Google OAuth",
    body: "No user row exists until activation. OAuth tokens never leak into history — only single-use handoff codes do.",
  },
  {
    tag: "Foods",
    title: "Nutrition Hub",
    body: "USDA primary, Open Food Facts fallback, normalized per-100g and cached in Postgres for instant repeat lookups.",
  },
  {
    tag: "Cookbook",
    title: "The Scroll of Recipes",
    body: "Spoonacular → TheMealDB fallback. Tap any ingredient to jump straight into the Nutrition Hub with the query pre-filled.",
  },
  {
    tag: "Set",
    title: "AI inside a safety envelope",
    body: "Qwen-Plus advises within a backend-clamped numerical safety boundary — the model never recalculates your 1RM.",
  },
  {
    tag: "Marketplace",
    title: "Dual-currency escrow",
    body: "Fiat via Duitku, USDC via Solana escrow contract. Disputes freeze funds until an admin resolves the case.",
  },
  {
    tag: "World",
    title: "3D navigation hub",
    body: "A Three.js / Babylon fantasy map where hotspots become your routes — Nutrition, Astral Profile, Workshop, Cookbook.",
  },
];

export function HorizontalCards() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-75%"]);

  return (
    <section ref={ref} className="relative h-[400vh] bg-background text-foreground">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="flex items-end justify-between px-10 pt-16 md:px-20">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.4em] text-primary/80">Chapter IV — The system</p>
            <h2 className="font-serif text-4xl font-light leading-tight md:text-6xl">
              Six pillars,<br /><span className="italic text-primary">one journey.</span>
            </h2>
          </div>
          <p className="hidden max-w-xs text-sm text-white/50 md:block">
            Drift sideways through the ReLive system — every card a flow already wired into the monorepo.
          </p>
        </div>

        <motion.div style={{ x }} className="mt-16 flex h-full gap-8 pl-10 md:pl-20">
          {CARDS.map((c, i) => (
            <article
              key={i}
              className="flex h-[55vh] w-[70vw] shrink-0 flex-col justify-between rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur-xl md:w-[40vw]"
            >
              <div>
                <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-primary">
                  {c.tag}
                </span>
                <h3 className="mt-8 font-serif text-3xl font-light leading-tight md:text-4xl">{c.title}</h3>
              </div>
              <p className="text-white/60">{c.body}</p>
              <div className="text-6xl font-light text-white/10">0{i + 1}</div>
            </article>
          ))}
          <div className="w-[20vw] shrink-0" />
        </motion.div>
      </div>
    </section>
  );
}
