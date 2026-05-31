"use client";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Aceternity "Background Boxes" — exact duplicate of the provided
 * React App.html reference. Skewed perspective grid of bordered boxes with
 * "+" markers on alternating cells, centered card on a dot-grid canvas.
 */

const ROWS = 150;
const COLS = 100;

const COLORS = [
  "rgb(125 211 252)", // sky-300
  "rgb(249 168 212)", // pink-300
  "rgb(134 239 172)", // green-300
  "rgb(253 224 71)",  // yellow-300
  "rgb(252 165 165)", // red-300
  "rgb(216 180 254)", // purple-300
  "rgb(147 197 253)", // blue-300
  "rgb(165 180 252)", // indigo-300
  "rgb(196 181 253)", // violet-300
];

function pickColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function BoxesCore() {
  const rows = useMemo(() => new Array(ROWS).fill(1), []);
  const cols = useMemo(() => new Array(COLS).fill(1), []);
  return (
    <div
      style={{
        transform: "translate(-40%, -60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)",
      }}
      className="absolute left-1/4 p-4 -top-1/4 flex -translate-x-1/2 -translate-y-1/2 w-full h-full z-0"
    >
      {rows.map((_, i) => (
        <motion.div key={`row-${i}`} className="w-16 h-8 border-l border-slate-700 relative">
          {cols.map((_, j) => (
            <motion.div
              whileHover={{ backgroundColor: pickColor(), transition: { duration: 0 } }}
              animate={{ transition: { duration: 2 } }}
              key={`col-${i}-${j}`}
              className="w-16 h-8 border-r border-t border-slate-700 relative"
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="absolute h-6 w-10 -top-[14px] -left-[22px] text-slate-700 stroke-[1px] pointer-events-none"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

export function BackgroundBoxes({ className }: { className?: string }) {
  return (
    <div className="relative flex items-center justify-center h-screen w-full m-auto p-16 bg-background text-foreground">
      <div className="absolute lab-bg inset-0 size-full">
        <div className="absolute inset-0 bg-[radial-gradient(#00000021_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px]" />
      </div>
      <div className={cn("flex w-full justify-center relative", className)}>
        <div className="h-96 relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-lg">
          <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
          <BoxesCore />
          <h1 className="md:text-4xl text-xl text-white relative z-20">Tailwind is Awesome</h1>
          <p className="text-center mt-2 text-neutral-300 relative z-20">
            Framer motion is the best animation library ngl
          </p>
        </div>
      </div>
    </div>
  );
}