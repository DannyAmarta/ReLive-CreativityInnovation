"use client"

import { useEffect, useState } from "react"
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { Engine } from "@tsparticles/engine"

export default function Birds() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  if (!init) return null

  return (
    <Particles
      className="absolute inset-0 z-5"
      options={{
        fullScreen: false,
        particles: {
          number: {
            value: 12
          },
          shape: {
            type: "triangle"
          },
          size: {
            value: 4
          },
          color: {
            value: "#ffffff"
          },
          move: {
            enable: true,
            speed: 1,
            direction: "right",
            straight: false,
            outModes: {
              default: "out"
            }
          },
          opacity: {
            value: 0.8
          }
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "repulse"
            }
          },
          modes: {
            repulse: {
              distance: 100
            }
          }
        },
        background: {
          color: "transparent"
        }
      }}
    />
  )
}
