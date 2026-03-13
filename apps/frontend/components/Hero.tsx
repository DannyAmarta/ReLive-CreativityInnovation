import Image from "next/image"
import Clouds from "./Cloud"
import Wallpaper from "@/public/assets/home/wallpaper.png"
import Birds from "./Bird"
export default function Hero() {
  return (
    <section className="relative h-screen w-full">
      {/* background image */}
      <Image
        src={Wallpaper.src}
        alt="wallpaper"
        className="object-cover"
        fill
        priority
      />

      {/* clouds */}
      <Clouds />
      {/* birds */}
      <Birds/>

      {/* hero content */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 className="text-5xl font-bold text-white">
          Welcome to Health World
        </h1>
      </div>

    </section>
  )
}