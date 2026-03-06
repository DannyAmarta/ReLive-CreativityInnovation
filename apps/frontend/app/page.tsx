import FallingLeaves from "../components/FallingLeaves"
import Header from "../components/Header"
import Hero from "../components/Hero"
import AboutUs from "../components/AboutUs"
import LoremC from "../components/AboutUsDesignWhite"
import Lorem2 from "../components/Lorem2"
import Lorem3 from "../components/Lorem3"
 
export default function Home() {
  return (
    <>
      <FallingLeaves/>
      <main className="relative">
        <Header/>
        <Hero/>
        <AboutUs/>
        {/* <LoremC/> */}
        <Lorem2/>
        <Lorem3/>
      </main>
    </>
  );
}
