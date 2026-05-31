"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const CARDS = [
  {
    tag: "01 — Nutrition Hub",
    title: "Every meal, weighed in starlight.",
    body: "Search anything — a protein bar, a mango, a leftover stew. ReLive checks the USDA archive first, then Open Food Facts, then caches it for the next traveler. Serving math recalculates live in your hands.",
    accent: "from-aurora/30 to-celestial/20",
  },
  {
    tag: "02 — Scroll Cookbook",
    title: "Recipes that read like spells.",
    body: "Parchment-styled, ingredient-linked, macro-aware. Tap a herb mid-recipe and you're already standing in the Nutrition Hub with it queued.",
    accent: "from-celestial/30 to-accent/20",
  },
  {
    tag: "03 — Set Calculator",
    title: "Strength, without the lying.",
    body: "RIR-aware 1RM math, chosen per movement family. A quiet CNS-fatigue guard refuses to let one bad afternoon poison your baseline.",
    accent: "from-accent/30 to-primary/20",
  },
  {
    tag: "04 — Safety Envelope AI",
    title: "A coach that cannot recklessly improvise.",
    body: "The server pre-computes your safe weight, rep, and set window. The model writes the encouragement; the math is non-negotiable.",
    accent: "from-primary/30 to-aurora/20",
  },
  {
    tag: "05 — Trainer Escrow",
    title: "Trust, locked in two currencies.",
    body: "Pay in IDR through Duitku or USDC on Solana. Funds rest in escrow until the session lands — disputes go to humans, refunds go home.",
    accent: "from-aurora/30 to-primary/20",
  },
];

export function FeatureCards() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  // Move horizontally across (N-1) card widths worth of distance
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${(CARDS.length - 1) * 100}%`]);

  return (
    <section ref={ref} className="relative bg-background" style={{ height: `${CARDS.length * 100}vh` }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-6 pt-16 text-center">
          <p className="font-display text-sm uppercase tracking-[0.4em] text-aurora/90">The Toolkit</p>
          <h2 className="mt-3 font-display text-4xl md:text-6xl leading-[0.95] text-foreground">
            Five rooms, <span className="italic text-celestial">one chapel.</span>
          </h2>
        </div>

        <div className="flex flex-1 items-center">
          <motion.div style={{ x }} className="flex shrink-0 gap-8 pl-[10vw] pr-[10vw]">
            {CARDS.map((card, i) => (
              <article
                key={card.tag}
                className="relative flex h-[64vh] w-[80vw] max-w-[820px] shrink-0 flex-col justify-between overflow-hidden rounded-3xl border border-white/15 bg-card/80 p-10 backdrop-blur-xl md:p-14"
              >
                <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${card.accent}`} />
                <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-celestial/30 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-aurora/20 blur-3xl" />

                <div className="relative z-10 flex items-center justify-between">
                  <p className="font-display text-xs uppercase tracking-[0.35em] text-white/85">{card.tag}</p>
                  <p className="font-display text-xs tracking-[0.3em] text-white/55">
                    {String(i + 1).padStart(2, "0")} / {String(CARDS.length).padStart(2, "0")}
                  </p>
                </div>
                <div className="relative z-10 max-w-2xl">
                  <h3 className="font-display text-4xl md:text-6xl leading-[1.02] text-white">{card.title}</h3>
                  <p className="mt-6 max-w-xl text-base md:text-lg leading-relaxed text-white/85">{card.body}</p>
                </div>
              </article>
            ))}
          </motion.div>
        </div>

        <div className="pb-6 text-center text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Keep scrolling ↦
        </div>
      </div>
    </section>
  );
}
