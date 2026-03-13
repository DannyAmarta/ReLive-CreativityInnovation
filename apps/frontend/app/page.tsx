import FallingLeaves from "../components/FallingLeaves";
import Header from "../components/landing/Header";
import Hero from "../components/landing/Hero";
// import dynamic from "next/dynamic"

// const SkyScene = dynamic(() => import("@/components/Sky"), {
//   ssr: false,
// })
import LoremC from "../components/prev/AboutUsDesignWhite";
import Lorem2 from "../components/prev/Lorem2";
import Lorem3 from "../components/prev/Lorem3";
import SkyComponent from "@/components/landing/Sky";
import AboutUs from "../components/landing/AboutUs";

export default function Home() {
    return (
        <>
            {/* <FallingLeaves/> */}
            <Header />
            <Hero />
            <SkyComponent />
            <AboutUs />
            {/* <LoremC/> */}
            {/* <Lorem2/> */}
            {/* <Lorem3/> */}
        </>
    );
}
