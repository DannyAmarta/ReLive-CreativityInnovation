import type { Metadata } from "next";
import { ParallaxHero } from "@/components/landing-celestial/ParallaxHero";
import { SvgFollowScroll } from "@/components/landing-celestial/SvgFollowScroll";
import { LeftRightParallax } from "@/components/landing-celestial/LeftRightParallax";
import { FeatureCards } from "@/components/landing-celestial/FeatureCards";
import { ScrollGallery } from "@/components/landing-celestial/ScrollGallery";
import { MotionFooter } from "@/components/landing-celestial/MotionFooter";

export const metadata: Metadata = {
  title: "ReLive — A celestial wellness companion",
  description: "ReLive is a magical wellness world where training, nutrition, and trusted coaching live as terrain you wander. Honest 1RM math, dual-currency trainer escrow, and a 3D map of your becoming.",
  openGraph: {
    title: "ReLive — A celestial wellness companion",
    description: "Train, eat, and recover inside a world that listens.",
    type: "website",
  },
};

export default function Home2Page() {
  return (
    <div className="celestial-theme">
      <main className="dark relative min-h-screen w-full overflow-x-hidden bg-background text-foreground">
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
