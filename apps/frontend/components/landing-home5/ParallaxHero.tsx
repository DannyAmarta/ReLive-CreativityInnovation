"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import skyImg from "@/assets/home5/parallax-sky.webp";
import mountainImg from "@/assets/home5/parallax-mountain.webp";
import foregroundImg from "@/assets/home5/parallax-foreground.webp";

gsap.registerPlugin(ScrollTrigger);

/**
 * Osmo-style 4-layer parallax — GSAP ScrollTrigger scrubbed to scroll,
 * smoothed by Lenis. Each layer translates a different yPercent so the
 * scene gains 3D depth as the user scrolls.
 */
export function ParallaxHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Ensure page starts at top so ScrollTrigger scrub initialises at progress 0
    window.scrollTo(0, 0);
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: layersRef.current,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0,
        },
      });
      tl.fromTo(
        "[data-parallax-layer='1']",
        { yPercent: 0 },
        { yPercent: 70, ease: "none" },
        0,
      )
        .fromTo(
          "[data-parallax-layer='2']",
          { yPercent: 0 },
          { yPercent: 55, ease: "none" },
          0,
        )
        .fromTo(
          "[data-parallax-layer='3']",
          { yPercent: 0 },
          { yPercent: 40, ease: "none" },
          0,
        )
        .fromTo(
          "[data-parallax-layer='4']",
          { yPercent: 0 },
          { yPercent: 10, ease: "none" },
          0,
        );
    }, sectionRef);

    return () => {
      ctx.revert();
      lenis.destroy();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-dvh w-full bg-black"
    >
      <div ref={layersRef} className="parallax__layers absolute inset-0 overflow-hidden">
        {/* Layer 1 — back sky (moves fastest) */}
        <div
          data-parallax-layer="1"
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={skyImg.src}
            alt="moonlit sky over the cascades"
            className="h-full w-full object-cover object-top"
          />
        </div>

        {/* Layer 2 — mid mountain ridgeline */}
        <div
          data-parallax-layer="2"
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={mountainImg.src}
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-center"
          />
        </div>

        {/* Layer 3 — title */}
        <div
          data-parallax-layer="3"
          className="absolute inset-0 z-40 flex flex-col items-center justify-center px-6 text-center will-change-transform"
        >
          <span className="mb-6 rounded-full border border-white/20 bg-black/30 px-4 py-1.5 text-[11px] uppercase tracking-[0.4em] text-white/85 backdrop-blur-md">
            A celestial wellness world
          </span>
          <h1 className="font-serif text-[clamp(4rem,14vw,12rem)] font-light leading-[0.9] tracking-tight text-white drop-shadow-[0_4px_28px_rgba(0,0,0,0.45)]">
            Re<span className="italic text-primary-foreground">Live</span>
          </h1>
          <p className="mt-6 max-w-xl text-balance text-base text-white/85 md:text-lg">
            Nutrition, training, and trainer marketplaces — bound together inside an explorable 3D world for the body you're becoming.
          </p>
        </div>

        {/* Layer 4 — foreground hill with figure (moves slowest) */}
        <div
          data-parallax-layer="4"
          className="absolute inset-0 z-30 will-change-transform"
        >
          <img
            src={foregroundImg.src}
            alt=""
            aria-hidden
            className="h-full w-full object-cover object-center"
          />
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 z-40 -translate-x-1/2 text-[10px] uppercase tracking-[0.5em] text-white/70">
        scroll to enter
      </div>
    </section>
  );
}