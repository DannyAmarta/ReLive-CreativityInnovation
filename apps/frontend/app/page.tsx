import FallingLeaves from "./components/FallingLeaves"
import Header from "./components/Header"
import Hero from "./components/Hero"
import Test from "./components/test"
 
export default function Home() {
  return (
    <>
      <FallingLeaves/>
      <main className="relative z-20">
        <Header/>
        <Hero/>
        <Test/>
      </main>
    </>
  );
}
