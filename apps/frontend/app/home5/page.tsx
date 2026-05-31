import type { Metadata } from "next";
import { ParallaxHero } from "@/components/landing-home5/ParallaxHero";
import { ZoomParallax } from "@/components/landing-home5/ZoomParallax";
import { HorizontalText } from "@/components/landing-home5/HorizontalText";
import { BackgroundBoxes } from "@/components/landing-home5/BackgroundBoxes";
import { HorizontalCards } from "@/components/landing-home5/HorizontalCards";
import { MotionFooter } from "@/components/landing-home5/MotionFooter";

export const metadata: Metadata = {
  title: "ReLive — A celestial wellness world",
  description: "ReLive weaves nutrition, training, AI coaching, and a dual-currency trainer marketplace into one explorable 3D wellness world.",
  openGraph: {
    title: "ReLive — A celestial wellness world",
    description: "Nutrition, training, escrowed coaching, and a 3D world — one celestial monorepo.",
  },
};

export default function Home5Page() {
  return (
    <div className="relive-theme">
      <main className="bg-background text-foreground">
        <ParallaxHero />
        <ZoomParallax />
        <HorizontalText />
        <BackgroundBoxes />
        <HorizontalCards />
        <MotionFooter />
      </main>
    </div>
  );
}
