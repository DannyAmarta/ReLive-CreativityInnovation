import { LazySkyComponent } from "../components/landing/components/LazySkyComponent";
import LandingHeader from "../components/landing/sections/LandingHeader";
import LandingHero from "../components/landing/sections/LandingHero";
import LandingAbout from "../components/landing/sections/LandingAbout";
import type { Metadata } from "next";
// home 5
import { ParallaxHero } from "@/components/landing-home5/ParallaxHero";
import { ZoomParallax } from "@/components/landing-home5/ZoomParallax";
import { HorizontalText } from "@/components/landing-home5/HorizontalText";
import { BackgroundBoxes } from "@/components/landing-home5/BackgroundBoxes";

// home 6
import { SvgFollowScroll } from "@/components/landing-home6/SvgFollowScroll";
import { LeftRightParallax } from "@/components/landing-home6/LeftRightParallax";

// home 7
import ScrollFlipRoles from "@/components/landing-home7/ScrollFlipRoles";
import HorizontalCards from "@/components/landing-home7/HorizontalCards";
import StickyCards from "@/components/landing-home7/StickyCards";
import Testimonials from "@/components/landing-home7/Testimonials";
import MotionFooter from "@/components/landing-home7/MotionFooter";

export const metadata: Metadata = {
  title: "ReLive",
  description: "ReLive weaves nutrition, training, AI coaching, and a dual-currency trainer marketplace into one explorable 3D wellness world.",
  openGraph: {
    title: "ReLive — A celestial wellness world",
    description: "Nutrition, training, escrowed coaching, and a 3D world — one celestial monorepo.",
  },
};

export default function Home() {
    return (
        <>
            <LandingHeader />

            <ParallaxHero />
            <ScrollFlipRoles />

            <SvgFollowScroll />
            <LeftRightParallax />
            <ZoomParallax />
            <StickyCards />
            {/* <BackgroundBoxes /> */}
            <HorizontalCards />
            <HorizontalText />
            <Testimonials />
            <MotionFooter />
            {/* <LandingHero /> */}
            {/* <LazySkyComponent /> */}
            {/* <AboutUs /> */}
        </>
    );
}
