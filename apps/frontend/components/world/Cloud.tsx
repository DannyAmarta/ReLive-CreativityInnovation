"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Clouds1 from "@/public/assets/home/Cloud1.jpg"
import Clouds2 from "@/public/assets/home/Cloud2.jpg"
import Clouds3 from "@/public/assets/home/Cloud3.jpg"
export default function Clouds() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">

      {/* Cloud 1 */}
      <motion.div
        className="absolute top-20 left-[-200px]"
        animate={{ x: ["0%", "120vw"] }}
        transition={{
          duration: 120,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Image
          src={Clouds1.src}
          alt="cloud1"
          width={400}
          height={200}
          className="opacity-40"
        />
      </motion.div>

      {/* Cloud 2 */}
      <motion.div
        className="absolute top-40 left-[-300px]"
        animate={{ x: ["0%", "120vw"] }}
        transition={{
          duration: 160,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <Image
          src={Clouds2.src}
          alt="cloud2"
          width={500}
          height={250}
          className="opacity-30"
        />
      </motion.div>

    </div>
  )
}