import type { Metadata } from "next";
import { ParallaxHero } from "@/components/landing-home6/ParallaxHero";
import { SvgFollowScroll } from "@/components/landing-home6/SvgFollowScroll";
import { LeftRightParallax } from "@/components/landing-home6/LeftRightParallax";
import { FeatureCards } from "@/components/landing-home6/FeatureCards";
import { ScrollGallery } from "@/components/landing-home6/ScrollGallery";
import { MotionFooter } from "@/components/landing-home6/MotionFooter";

export const metadata: Metadata = {
  title: "ReLive — A celestial wellness companion",
  description: "ReLive is a magical wellness world where training, nutrition, and trusted coaching live as terrain you wander. Honest 1RM math, dual-currency trainer escrow, and a 3D map of your becoming.",
  openGraph: {
    title: "ReLive — A celestial wellness companion",
    description: "Train, eat, and recover inside a world that listens.",
  },
};

export default function Home6Page() {
  return (
    <div className="celestial-theme">
      <main className="relive-theme relative min-h-screen w-full bg-background text-foreground">
        <ParallaxHero />
        <SvgFollowScroll />
        <LeftRightParallax />
        <FeatureCards />
        <ScrollGallery />
        <MotionFooter />
      </main>
    </div>
  );
}
