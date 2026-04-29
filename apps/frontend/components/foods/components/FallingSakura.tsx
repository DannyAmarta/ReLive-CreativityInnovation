"use client";

import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import Image from "next/image";

import BranchLeft1 from "@/public/assets/sakura/branchLeft1.png";
import SakuraBaldLeft from "@/public/assets/sakura/sakuraBaldLeft.png";
import SakuraTreeEdgeRight from "@/public/assets/sakura/sakuraTreeEdgeRight.png";
import Cluster from "@/public/assets/sakura/cluster.png";
import Corner from "@/public/assets/sakura/corner.png";
import Wallpaper from "@/public/assets/sakura/wallpaper4.png";

// Inline SVG petal shapes as data URIs for tsParticles
const PETAL_SVGS = [
  // Classic 5-petal sakura
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><g transform='translate(20,20)'><ellipse cx='0' cy='-10' rx='4.5' ry='8' fill='%23FFB7C5' fill-opacity='0.92' transform='rotate(0)'/><ellipse cx='0' cy='-10' rx='4.5' ry='8' fill='%23FFB7C5' fill-opacity='0.92' transform='rotate(72)'/><ellipse cx='0' cy='-10' rx='4.5' ry='8' fill='%23FFB7C5' fill-opacity='0.92' transform='rotate(144)'/><ellipse cx='0' cy='-10' rx='4.5' ry='8' fill='%23FFB7C5' fill-opacity='0.92' transform='rotate(216)'/><ellipse cx='0' cy='-10' rx='4.5' ry='8' fill='%23FFB7C5' fill-opacity='0.92' transform='rotate(288)'/><circle cx='0' cy='0' r='3.2' fill='%23FFE4ED' fill-opacity='0.95'/></g></svg>`,
  // Slightly different pink shade
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><g transform='translate(20,20)'><ellipse cx='0' cy='-10' rx='4.2' ry='7.5' fill='%23FFD1DC' fill-opacity='0.9' transform='rotate(0)'/><ellipse cx='0' cy='-10' rx='4.2' ry='7.5' fill='%23FFD1DC' fill-opacity='0.9' transform='rotate(72)'/><ellipse cx='0' cy='-10' rx='4.2' ry='7.5' fill='%23FFD1DC' fill-opacity='0.9' transform='rotate(144)'/><ellipse cx='0' cy='-10' rx='4.2' ry='7.5' fill='%23FFD1DC' fill-opacity='0.9' transform='rotate(216)'/><ellipse cx='0' cy='-10' rx='4.2' ry='7.5' fill='%23FFD1DC' fill-opacity='0.9' transform='rotate(288)'/><circle cx='0' cy='0' r='2.8' fill='%23FFF0F5'/></g></svg>`,
  // Deeper rose petal
  `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'><g transform='translate(20,20)'><ellipse cx='0' cy='-9' rx='4' ry='7' fill='%23F9A8C0' fill-opacity='0.85' transform='rotate(0)'/><ellipse cx='0' cy='-9' rx='4' ry='7' fill='%23F9A8C0' fill-opacity='0.85' transform='rotate(72)'/><ellipse cx='0' cy='-9' rx='4' ry='7' fill='%23F9A8C0' fill-opacity='0.85' transform='rotate(144)'/><ellipse cx='0' cy='-9' rx='4' ry='7' fill='%23F9A8C0' fill-opacity='0.85' transform='rotate(216)'/><ellipse cx='0' cy='-9' rx='4' ry='7' fill='%23F9A8C0' fill-opacity='0.85' transform='rotate(288)'/><circle cx='0' cy='0' r='2.5' fill='%23FDE8EE' fill-opacity='0.9'/></g></svg>`,
];

export function FallingSakura() {
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
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* ── Sakura wash background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#fff5f8] via-[#fde8f0] to-[#f8e0ec]" />

      {/* ── Subtle wallpaper texture (Optimized) ── */}
      <div className="absolute inset-0">
        <Image
          src={Wallpaper}
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* ── Glowing orbs (Optimized without blur) ── */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(255,183,197,0.3)_0%,transparent_70%)]" />
      <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(249,168,192,0.2)_0%,transparent_70%)]" />
      <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(255,209,220,0.25)_0%,transparent_70%)]" />

      {/* ── Left branches ── */}
      <div className="absolute bottom-0 left-0 z-10 h-[75vh] w-auto opacity-80"
        style={{ transform: "rotate(2deg) translateX(-4%)" }}
      >
        <Image
          src={BranchLeft1}
          alt=""
          className="h-full w-auto object-contain object-bottom"
        />
      </div>

      {/* ── Bald/dark branch left (depth layer) ── */}
      <div className="absolute bottom-0 left-2 z-[8] hidden h-[50vh] w-auto opacity-25 lg:block">
        <Image
          src={SakuraBaldLeft}
          alt=""
          className="h-full w-auto object-contain object-bottom"
        />
      </div>

      {/* ── Right cherry tree edge ── */}
      <div className="absolute bottom-0 right-0 z-[8] hidden h-[90vh] w-auto opacity-40 xl:block"
        style={{ transform: "translateX(8%)" }}
      >
        <Image
          src={SakuraTreeEdgeRight}
          alt=""
          className="h-full w-auto max-w-none object-contain object-bottom"
        />
      </div>

      {/* ── Cluster top-right ── */}
      <div className="absolute -top-8 right-0 z-10 hidden w-[340px] opacity-50 lg:block"
        style={{ transform: "rotate(-8deg) translateX(8%)" }}
      >
        <Image src={Cluster} alt="" className="w-full" />
      </div>

      {/* ── Corner ornament ── */}
      <div className="absolute top-0 right-0 z-10 hidden w-56 opacity-30 lg:block">
        <Image src={Corner} alt="" className="w-full" />
      </div>

      {/* ── tsParticles falling petals ── */}
      {engineReady && (
        <Particles
          id="sakura-petals"
          className="absolute inset-0 z-20"
          options={{
            fullScreen: { enable: false, zIndex: 20 },
            fpsLimit: 60,
            particles: {
              number: {
                value: 35,
                density: { enable: true, width: 1200, height: 900 },
              },
              shape: {
                type: "image",
                options: {
                  image: PETAL_SVGS.map((svg) => ({
                    src: `data:image/svg+xml;charset=utf8,${svg}`,
                    width: 40,
                    height: 40,
                  })),
                },
              },
              size: { value: { min: 10, max: 22 } },
              opacity: {
                value: { min: 0.35, max: 0.85 },
                animation: { enable: true, speed: 0.4, sync: false },
              },
              move: {
                enable: true,
                speed: { min: 1.2, max: 3.0 },
                direction: "bottom-left" as const,
                straight: false,
                outModes: { default: "out" as const },
                warp: false,
                gravity: { enable: false },
                drift: { min: -0.5, max: 0.5 },
              },
              rotate: {
                value: { min: 0, max: 360 },
                animation: { enable: true, speed: 3, sync: false },
                direction: "random" as const,
              },
              wobble: {
                enable: true,
                distance: 20,
                speed: { min: -1.5, max: 1.5 },
              },
            },
            detectRetina: true,
          }}
        />
      )}
    </div>
  );
}
