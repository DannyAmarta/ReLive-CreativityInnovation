"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { Engine } from "@tsparticles/engine";

/* ═══════════════════════════════════════════════════════
   Cosmic star field using tsparticles
   Twinkling, slow-drifting white dots on transparent bg
   ═══════════════════════════════════════════════════════ */

export function StarParticles() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (!init) return null;

  return (
    <Particles
      id="star-particles"
      options={{
        fullScreen: false,
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        particles: {
          number: {
            value: 160,
            density: { enable: true },
          },
          color: { value: ["#ffffff", "#fffbe6", "#d4c5ff", "#a8d8ff"] },
          shape: { type: "circle" },
          opacity: {
            value: { min: 0.15, max: 0.9 },
            animation: {
              enable: true,
              speed: 0.8,
            },
          },
          size: {
            value: { min: 0.5, max: 2.5 },
            animation: {
              enable: true,
              speed: 0.5,
            },
          },
          move: {
            enable: true,
            speed: 0.15,
            direction: "none",
            random: true,
            straight: false,
            outModes: { default: "out" },
          },
          twinkle: {
            particles: {
              enable: true,
              frequency: 0.04,
              opacity: 1,
              color: { value: "#fff8e0" },
            },
          },
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: "bubble" },
          },
          modes: {
            bubble: {
              distance: 120,
              size: 3.5,
              duration: 2,
              opacity: 1,
            },
          },
        },
        detectRetina: true,
      }}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    />
  );
}
