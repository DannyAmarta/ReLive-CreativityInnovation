// "use client"

// import { motion } from "framer-motion"
// import { useRef } from "react"

// export default function Mouth({ mouse, width = 24 }: any) {

//   const ref = useRef<HTMLDivElement>(null)

//   let x = 0

//   if (ref.current) {

//     const rect = ref.current.getBoundingClientRect()
//     const centerX = rect.left + rect.width / 2

//     const dx = mouse.x - centerX

//     const max = 6

//     const distance = Math.abs(dx)

//     if (distance > max) {
//       x = (dx / distance) * max
//     } else {
//       x = dx
//     }
//   }

//   return (
//     <motion.div
//       ref={ref}
//       animate={{ x }}
//       transition={{ type: "spring", stiffness: 300, damping: 20 }}
//       style={{ width }}
//       className="h-[3px] bg-black rounded-full"
//     />
//   )
// }
"use client"

import { motion } from "framer-motion"
import { useRef } from "react"

interface MouthProps {
  mouse: { x: number; y: number }
  width?: number
  sad?: boolean
}

export default function Mouth({ mouse, width = 24, sad = false }: MouthProps) {
  const ref = useRef<HTMLDivElement>(null)

  let x = 0

  if (ref.current) {
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const dx = mouse.x - centerX
    const max = 6
    const distance = Math.abs(dx)
    x = distance > max ? (dx / distance) * max : dx
  }

  if (sad) {
    // Sad: a downward arc (frown)
    return (
      <motion.div
        ref={ref}
        animate={{ x, scaleX: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        style={{ width }}
        className="mt-2 h-[3px] bg-black rounded-full origin-center"
      >
        {/* frown using border trick */}
        <div
          style={{ width }}
          className="h-[6px] border-t-[3px] border-black rounded-t-full -mt-[3px]"
        />
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      animate={{ x }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ width }}
      className="h-[3px] bg-black rounded-full"
    />
  )
}
