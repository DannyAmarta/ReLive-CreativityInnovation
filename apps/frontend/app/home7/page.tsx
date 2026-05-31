import type { Metadata } from "next";
import ParallaxHero from "@/components/landing-home7/ParallaxHero";
import ScrollFlipRoles from "@/components/landing-home7/ScrollFlipRoles";
import HorizontalCards from "@/components/landing-home7/HorizontalCards";
import StickyCards from "@/components/landing-home7/StickyCards";
import Testimonials from "@/components/landing-home7/Testimonials";
import MotionFooter from "@/components/landing-home7/MotionFooter";

export const metadata: Metadata = {
  title: "ReLive — A vocabulary for the living body",
  description: "ReLive is a botanical wellness universe: nutrition, AI-coached training, trainer escrow, and an explorable 3D world for your health journey.",
  openGraph: {
    title: "ReLive — A vocabulary for the living body",
    description: "Re-enchant the body. Nutrition, training, trainer escrow and a living 3D world.",
  },
};

export default function Home7Page() {
  return (
    <div className="galactic-theme">
      <main className="relive-light-theme antialiased">
        <ParallaxHero />
        <ScrollFlipRoles />
        <HorizontalCards />
        <StickyCards />
        <Testimonials />
        <MotionFooter />
      </main>
    </div>
  );
}
