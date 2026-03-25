"use client";

import Image from "next/image"
import dynamic from "next/dynamic"

// Lazy-load: FallingLeaves imports 25 leaf PNGs + heavy framer-motion
// keyframe animations. Deferring keeps the Hero visible on first paint.
const FallingLeaves = dynamic(
  () => import("./FallingLeaves"),
  { ssr: false, loading: () => null }
)

const Hero = () => {
  return (
    // kenapa harus calc karena h-20 di heading jadi harus h-80
    // semua harus pake h-full karena static 80
    //untuk justify center dalem hanya bisa bekerja jika smeua parent punya height sedangkan kita mau semua center, mending main parent height+ flex center
    <>
      <FallingLeaves />
      <section className="relative h-[calc(100vh-5rem)] flex items-center justify-center z-20">
        <div className="container mx-auto px-20 text-center">
          <h1 className="text-7xl font-bold tracking-tight bg-gradient-to-r from-orange-900 via-amber-700 to-red-600 text-transparent bg-clip-text">ReLive</h1>
          <p className="text-xl tracking-tight mt-6">Recharge Your Life, Relive Your Health.</p>
          <button className="btn btn-text mt-8 ">Start Now!</button>
        </div>
      </section>
    </>
  )
}

export default Hero