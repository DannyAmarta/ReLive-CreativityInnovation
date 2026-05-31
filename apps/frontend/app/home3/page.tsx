import type { Metadata } from "next";
import { ParallaxHero } from "@/components/landing-relive/ParallaxHero";
import { SvgFollowScroll } from "@/components/landing-relive/SvgFollowScroll";
import { HorizontalText } from "@/components/landing-relive/HorizontalText";
import { ScrollImages } from "@/components/landing-relive/ScrollImages";
import { HorizontalCards } from "@/components/landing-relive/HorizontalCards";
import { MotionFooter } from "@/components/landing-relive/MotionFooter";

export const metadata: Metadata = {
  title: "ReLive — A celestial wellness world",
  description: "ReLive weaves nutrition, training, AI coaching, and a dual-currency trainer marketplace into one explorable 3D wellness world.",
  openGraph: {
    title: "ReLive — A celestial wellness world",
    description: "Nutrition, training, escrowed coaching, and a 3D world — one celestial monorepo.",
  },
};

export default function Home3Page() {
  return (
    <div className="relive-theme">
      <main className="bg-background text-foreground">
        <ParallaxHero />
        <SvgFollowScroll />
        <HorizontalText />
        <ScrollImages />
        <HorizontalCards />
        <MotionFooter />
      </main>
    </div>
  );
}
