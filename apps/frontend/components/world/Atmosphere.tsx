"use client";

import { useEffect, useState, useMemo } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

export function Atmosphere() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const cloudOptions: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: {
          value: 12,
          density: { enable: false },
        },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
          value: { min: 0.15, max: 0.45 },
        },
        size: {
          value: { min: 60, max: 180 },
        },
        move: {
          enable: true,
          speed: { min: 0.3, max: 0.8 },
          direction: "right" as const,
          outModes: { default: "out" as const },
          straight: false,
        },
      },
      detectRetina: true,
    }),
    []
  );

  const birdOptions: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: {
          value: 6,
          density: { enable: false },
        },
        color: { value: "#333333" },
        shape: { type: "char", options: { char: { value: "🕊", font: "Segoe UI Emoji", weight: "400" } } },
        opacity: {
          value: { min: 0.6, max: 1 },
        },
        size: {
          value: { min: 12, max: 20 },
        },
        move: {
          enable: true,
          speed: { min: 1, max: 2.5 },
          direction: "top-right" as const,
          outModes: { default: "out" as const },
          straight: false,
          warp: false,
        },
        wobble: {
          enable: true,
          distance: 10,
          speed: 5,
        },
      },
      detectRetina: true,
    }),
    []
  );

  if (!init) return null;

  return (
    <>
      <div className="absolute inset-0 pointer-events-none z-10" style={{ width: "100%", height: "100%" }}>
        <Particles id="clouds-particles" options={cloudOptions} />
      </div>
      <div className="absolute inset-0 pointer-events-none z-10" style={{ width: "100%", height: "100%" }}>
        <Particles id="birds-particles" options={birdOptions} />
      </div>
    </>
  );
}
