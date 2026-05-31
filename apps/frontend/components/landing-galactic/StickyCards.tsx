"use client";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef } from "react";

const CARDS = [
  {
    title: "The Booking Lifecycle",
    sub: "PENDING → ACTIVE → COMPLETED",
    body: "Clients request, payments verify, trainers deliver. Disputes freeze escrow with admin resolution.",
    bg: "from-emerald-500/30 to-teal-700/20",
  },
  {
    title: "AI Coaching, Bounded",
    sub: "Qwen + Safety Envelope",
    body: "The backend computes safe set/rep/weight ranges. The LLM advises within them — never recalculates.",
    bg: "from-violet-500/30 to-indigo-700/20",
  },
  {
    title: "Dual-Currency Escrow",
    sub: "IDR via Duitku · USDC on Solana",
    body: "Fiat held server-side; crypto locked on-chain. Browser-signed releases for trustless payouts.",
    bg: "from-amber-500/25 to-rose-700/20",
  },
  {
    title: "CNS-Fatigue Aware",
    sub: "Append-only WorkoutSet ledger",
    body: "Sudden 1RM drops are flagged so a bad day never poisons your baseline.",
    bg: "from-sky-500/30 to-cyan-700/20",
  },
];

function Card({ i, total, progress, data }: { i: number; total: number; progress: MotionValue<number>; data: typeof CARDS[number] }) {
  const start = i / total;
  const end = (i + 1) / total;
  const scale = useTransform(progress, [start, end], [1, 1 - (total - i) * 0.04]);
  return (
    <div className="sticky top-0 h-screen flex items-center justify-center px-6">
      <motion.div
        style={{ scale, top: `calc(-5vh + ${i * 30}px)` }}
        className={`relative w-full max-w-4xl h-[70vh] rounded-[2rem] border border-white/15 bg-gradient-to-br ${data.bg} backdrop-blur-xl p-12 md:p-16 flex flex-col justify-between shadow-2xl`}
      >
        <div className="flex justify-between items-start">
          <span className="text-xs uppercase tracking-[0.3em] text-white/60">{data.sub}</span>
          <span className="text-xs font-mono text-white/40">0{i + 1}</span>
        </div>
        <div>
          <h3 className="text-4xl md:text-6xl font-serif font-light text-white leading-[1.05] mb-6">{data.title}</h3>
          <p className="text-white/75 text-lg md:text-xl max-w-2xl leading-relaxed">{data.body}</p>
        </div>
      </motion.div>
    </div>
  );
}

export default function StickyCards() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section ref={ref} className="relative bg-[#06060d] text-white">
      <div className="pt-32 pb-16 text-center px-6">
        <p className="text-xs uppercase tracking-[0.4em] text-white/40 mb-4">The Spine</p>
        <h2 className="text-4xl md:text-6xl font-serif font-light">Four pillars, stacked.</h2>
      </div>
      {CARDS.map((c, i) => (
        <Card key={i} i={i} total={CARDS.length} progress={scrollYProgress} data={c} />
      ))}
    </section>
  );
}
