"use client"

import { useRef } from 'react';
import Script from "next/script"
import Image from 'next/image';

export function Birds() {
  const ref = useRef<HTMLDivElement>(null)
  const effect = useRef<any>(null)

  const initBirds = () => {
    if (
      ref.current &&
      !effect.current &&
      (window as any).VANTA &&
      (window as any).THREE
    ) {
      effect.current = (window as any).VANTA.BIRDS({
        el: ref.current,
        // backgroundColor: 0x07192f,
        backgroundAlpha: 0,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        quantity: 5,
        birdSize: 1.5,
        wingSpan: 20,
        speedLimit: 5
      })
    }
  }

  return (
    <>
      {/* Load THREE first */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r134/three.min.js"
        strategy="afterInteractive"
        onLoad={initBirds}
      />

      {/* Then load Vanta */}
      <Script
        src="https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.birds.min.js"
        strategy="afterInteractive"
        onLoad={initBirds}
      />

      <div ref={ref} className="absolute inset-0 z-40 pointer-events-none " />
    </>
  )
}

export default function SkyComponent(){
    return(
        <section className='relative h-screen w-full'> 
            <Image src="/assets/wallpaper/wallpaper3.png" alt="clouds" className="object-cover asbolute inset-0 z-20 pointer-events-none" fill/>
            <Birds />
        </section>
    )
}