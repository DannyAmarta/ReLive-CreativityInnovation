"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";

/**
 * BlurHeading — typography blurs while off-screen, sharpens when scrolled
 * into view. Re-blurs when scrolled back up (reversible, scroll-bound).
 */
export default function BlurHeading({
  children,
  className = "",
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 90%", "start 35%"],
  });
  const blur = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.35, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [24, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  const MotionTag = motion(Tag as any);

  return (
    <div ref={ref}>
      <MotionTag style={{ filter, opacity, y }} className={className}>
        {children}
      </MotionTag>
    </div>
  );
}
