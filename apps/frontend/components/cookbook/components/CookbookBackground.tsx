"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Image from "next/image";

import Wallpaper from "@/public/assets/spring/wallpaper.png";

// Fresh lime-green spring leaf SVGs
const LEAF_SVGS = [
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><ellipse cx='20' cy='20' rx='6' ry='12' fill='%2386efac' fill-opacity='0.88' transform='rotate(20 20 20)'/><line x1='20' y1='8' x2='20' y2='32' stroke='%234ade80' stroke-width='1' stroke-opacity='0.6' transform='rotate(20 20 20)'/></svg>`,
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><ellipse cx='20' cy='20' rx='8' ry='10' fill='%2334d399' fill-opacity='0.82' transform='rotate(-15 20 20)'/><line x1='20' y1='10' x2='20' y2='30' stroke='%2316a34a' stroke-width='1' stroke-opacity='0.5' transform='rotate(-15 20 20)'/></svg>`,
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><ellipse cx='20' cy='20' rx='5' ry='9' fill='%23a3e635' fill-opacity='0.78' transform='rotate(35 20 20)'/></svg>`,
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><circle cx='20' cy='15' r='6' fill='%234ade80' fill-opacity='0.72'/><circle cx='14' cy='25' r='5.5' fill='%2386efac' fill-opacity='0.68'/><circle cx='26' cy='25' r='5.5' fill='%2386efac' fill-opacity='0.68'/></svg>`,
];

export function CookbookBackground() {
  const [engineReady, setEngineReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      if (mounted) setEngineReady(true);
    });
    return () => { mounted = false; };
  }, []);

  return (
    // <div
    //   aria-hidden="true"
    //   className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    // >
    //   {/* ── Just the clean, full-opacity Wallpaper ── */}
    //   <div className="absolute inset-0">
    //     <Image
    //       src={Wallpaper}
    //       alt="Spring Background"
    //       fill
    //       // CHANGED THIS: 'object-fill' stretches it so nothing is cut. 
    //       // If it looks too stretched, change this to 'object-contain'.
    //       className="object-cover" 
    //       priority
    //     />
    //   </div>

    //   {/* ── tsParticles spring leaves ── */}
    //   {engineReady && (
    //     <Particles
    //       id="spring-leaves"
    //       className="absolute inset-0 z-20"
    //       options={{
    //         fullScreen: { enable: false, zIndex: 20 },
    //         fpsLimit: 60,
    //         particles: {
    //           number: {
    //             value: 30,
    //             density: { enable: true, width: 1300, height: 900 },
    //           },
    //           shape: {
    //             type: "image",
    //             options: {
    //               image: LEAF_SVGS.map((svg) => ({
    //                 src: `data:image/svg+xml;charset=utf8,${svg}`,
    //                 width: 40,
    //                 height: 40,
    //               })),
    //             },
    //           },
    //           size: { value: { min: 9, max: 20 } },
    //           opacity: {
    //             value: { min: 0.30, max: 0.80 },
    //             animation: { enable: true, speed: 0.35, sync: false },
    //           },
    //           move: {
    //             enable: true,
    //             speed: { min: 0.8, max: 2.2 },
    //             direction: "bottom-left",
    //             straight: false,
    //             outModes: { default: "out" },
    //             gravity: { enable: false },
    //             drift: { min: -0.4, max: 0.6 },
    //           },
    //           rotate: {
    //             value: { min: 0, max: 360 },
    //             animation: { enable: true, speed: 2.5, sync: false },
    //             direction: "random",
    //           },
    //           wobble: {
    //             enable: true,
    //             distance: 22,
    //             speed: { min: -1.2, max: 1.2 },
    //           },
    //         },
    //         detectRetina: true,
    //       }}
    //     />
    //   )}
    // </div>
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    {/* ── 1. The Wallpaper Layer ── */}
    <div className="absolute inset-0">
      <Image
        src={Wallpaper}
        alt="Spring Background"
        fill
        className="object-cover"
        priority
      />
    </div>

    {/* ── 2. The Atmospheric Tint (NEW) ── */}
    {/* This makes the green leaves pop and ensures white text stays readable */}
    <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px] transition-all duration-700" />

    {/* ── 3. Subtle Vignette (NEW) ── */}
    {/* This focuses the user's eye on the center search bar */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(255,250,251,0.4)_100%)]" />

      {/* ── tsParticles spring leaves ── */}
      {/* {engineReady && (
        <Particles
          id="spring-leaves"
          className="absolute inset-0 z-20"
          options={{
            fullScreen: { enable: false, zIndex: 20 },
            fpsLimit: 60,
            particles: {
              number: {
                value: 30,
                density: { enable: true, width: 1300, height: 900 },
              },
              shape: {
                type: "image",
                options: {
                  image: LEAF_SVGS.map((svg) => ({
                    src: `data:image/svg+xml;charset=utf8,${svg}`,
                    width: 40,
                    height: 40,
                  })),
                },
              },
              size: { value: { min: 9, max: 20 } },
              opacity: {
                value: { min: 0.30, max: 0.80 },
                animation: { enable: true, speed: 0.35, sync: false },
              },
              move: {
                enable: true,
                speed: { min: 0.8, max: 2.2 },
                direction: "bottom-left",
                straight: false,
                outModes: { default: "out" },
                gravity: { enable: false },
                drift: { min: -0.4, max: 0.6 },
              },
              rotate: {
                value: { min: 0, max: 360 },
                animation: { enable: true, speed: 2.5, sync: false },
                direction: "random",
              },
              wobble: {
                enable: true,
                distance: 22,
                speed: { min: -1.2, max: 1.2 },
              },
            },
            detectRetina: true,
          }}
        />
      )} */}
    </div>
  );
}