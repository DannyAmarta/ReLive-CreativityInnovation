import type { Metadata } from "next";
import ParallaxHero from "@/components/landing-galactic/ParallaxHero";
import SvgFollowScroll from "@/components/landing-galactic/SvgFollowScroll";
import HorizontalCards from "@/components/landing-galactic/HorizontalCards";
import StickyCards from "@/components/landing-galactic/StickyCards";
import HeroScrollImages from "@/components/landing-galactic/HeroScrollImages";
import MotionFooter from "@/components/landing-galactic/MotionFooter";

export const metadata: Metadata = {
  title: "ReLive — A vocabulary for the living body",
  description: "ReLive is a magical wellness universe: nutrition, AI-coached training, trainer escrow, and an explorable 3D world for your health journey.",
  openGraph: {
    title: "ReLive — A vocabulary for the living body",
    description: "Re-enchant the body. Nutrition, training, trainer escrow and a living 3D world.",
  },
};

export default function HomePage() {
  return (
    <div className="galactic-theme">
      <main className="bg-[#0a0a14] text-white antialiased">
        <ParallaxHero />
        <SvgFollowScroll />
        <HorizontalCards />
        <StickyCards />
        <HeroScrollImages />
        <MotionFooter />
      </main>
    </div>
  );
}
