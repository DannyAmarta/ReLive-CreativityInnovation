"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function MotionFooter() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const rotate = useTransform(scrollYProgress, [0, 1], [-6, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0, 1]);

  return (
    <section ref={ref} className="relative bg-background pb-10 pt-32 text-foreground">
      <motion.footer
        style={{ scale, rotate }}
        className="relative mx-4 overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-[#1a1a2e] via-[#0f0f1d] to-black p-10 md:mx-10 md:p-16"
      >
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <h3 className="font-serif text-5xl font-light leading-none md:text-7xl">
              Re<span className="italic text-primary">Live</span>
            </h3>
            <p className="mt-6 max-w-sm text-white/60">
              A magical wellness world — nutrition, training, escrowed coaching, and an explorable 3D hub, woven into one celestial monorepo.
            </p>
            <motion.div style={{ opacity }} className="mt-10 flex items-center gap-3">
              <a className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:scale-[1.03]">
                Enter the world
              </a>
              <a className="rounded-full border border-white/15 px-6 py-3 text-sm text-white/80 transition hover:bg-white/5">
                Read the docs
              </a>
            </motion.div>
          </div>

          <FooterCol title="Product" items={["World", "Foods", "Cookbook", "Set Calculator"]} />
          <FooterCol title="Marketplace" items={["Find a Trainer", "Become a Trainer", "Fiat Escrow", "USDC on Solana"]} />
          <FooterCol title="Company" items={["About", "Roadmap", "Security", "Contact"]} />
        </div>

        <div className="relative mt-20 flex flex-wrap items-end justify-between gap-6 border-t border-white/10 pt-8 text-xs uppercase tracking-[0.3em] text-white/40">
          <span>© 2026 ReLive · A celestial wellness monorepo</span>
          <span>Built with Next · NestJS · Solana</span>
        </div>

        <div className="relative mt-10 select-none overflow-hidden">
          <h4 className="font-serif text-[18vw] font-light leading-[0.8] tracking-tight text-white/[0.04]">
            ReLive
          </h4>
        </div>
      </motion.footer>
    </section>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="mb-5 text-xs uppercase tracking-[0.3em] text-primary/80">{title}</p>
      <ul className="space-y-3 text-white/70">
        {items.map((i) => (
          <li key={i} className="cursor-pointer transition hover:text-white">{i}</li>
        ))}
      </ul>
    </div>
  );
}
