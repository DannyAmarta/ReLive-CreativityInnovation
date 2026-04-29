import { LazySkyComponent } from "../components/landing/components/LazySkyComponent";
import LandingHeader from "../components/landing/sections/LandingHeader";
import LandingHero from "../components/landing/sections/LandingHero";
import LandingAbout from "../components/landing/sections/LandingAbout";

export default function Home() {
    return (
        <>
            <LandingHeader />
            <LandingHero />
            {/* <LazySkyComponent /> */}
            {/* <AboutUs /> */}
        </>
    );
}
