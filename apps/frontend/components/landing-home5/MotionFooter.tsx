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
        className="relative mx-4 overflow-hidden rounded-[2.5rem] border border-primary/15 bg-gradient-to-br from-primary via-primary/90 to-foreground p-10 text-primary-foreground md:mx-10 md:p-16"
      >
        <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/30 blur-3xl" />

        <div className="relative grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <h3 className="font-serif text-5xl font-light leading-none md:text-7xl">
              Re<span className="italic text-accent">Live</span>
            </h3>
            <p className="mt-6 max-w-sm text-primary-foreground/70">
              A magical wellness world — nutrition, training, escrowed coaching, and an explorable 3D hub, woven into one celestial monorepo.
            </p>
            <motion.div style={{ opacity }} className="mt-10 flex items-center gap-3">
              <a className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition hover:scale-[1.03]">
                Enter the world
              </a>
              <a className="rounded-full border border-primary-foreground/25 px-6 py-3 text-sm text-primary-foreground/85 transition hover:bg-primary-foreground/10">
                Read the docs
              </a>
            </motion.div>
          </div>

          <FooterCol title="Product" items={["World", "Foods", "Cookbook", "Set Calculator"]} />
          <FooterCol title="Marketplace" items={["Find a Trainer", "Become a Trainer", "Fiat Escrow", "USDC on Solana"]} />
          <FooterCol title="Company" items={["About", "Roadmap", "Security", "Contact"]} />
        </div>

        <div className="relative mt-20 flex flex-wrap items-end justify-between gap-6 border-t border-primary-foreground/15 pt-8 text-xs uppercase tracking-[0.3em] text-primary-foreground/55">
          <span>© 2026 ReLive · A celestial wellness monorepo</span>
          <span>Built with Next · NestJS · Solana</span>
        </div>

        <div className="relative mt-10 select-none overflow-hidden">
          <h4 className="font-serif text-[18vw] font-light leading-[0.8] tracking-tight text-primary-foreground/[0.06]">
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
      <p className="mb-5 text-xs uppercase tracking-[0.3em] text-accent">{title}</p>
      <ul className="space-y-3 text-primary-foreground/80">
        {items.map((i) => (
          <li key={i} className="cursor-pointer transition hover:text-accent">{i}</li>
        ))}
      </ul>
    </div>
  );
}