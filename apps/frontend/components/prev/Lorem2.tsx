"use client";
import { useRef } from "react";
import Table from "@/public/assets/wallpaper/table7.png";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import BubbleSpam from "./BubbleTransition";

const Lorem2 = () => {
    const ref = useRef(null);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const blur = useTransform(
        scrollYProgress,
        [0, 1],
        ["blur(0px)", "blur(10px)"],
    );

    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0.4]);

    // bubble transition
    const bubbleScale = useTransform(scrollYProgress, [0.65, 1], [0, 10]);
    const bubbleOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);

    return (
        <section ref={ref} className="relative h-screen overflow-hidden z-20">
            {/* bg */}
            <motion.div
                style={{ filter: blur, scale, opacity }}
                className="absolute inset-0"
            >
                <Image
                    src={Table}
                    alt="Table"
                    fill
                    className="object-cover"
                    priority
                />
            </motion.div>
            {/* text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-white text-xl md:text-3xl lg:text-5xl text-center drop-shadow-2xl">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit.
                </p>
            </div>
            {/* bubble */}
            <motion.div
                style={{ scale: bubbleScale, opacity: bubbleOpacity }}
                className="
        absolute bottom-[-150px] left-1/2
        w-72 h-72
        -translate-x-1/2
        rounded-full
        bg-black
        z-30
        "
            />
            {/* fade */}
            <div className="absolute bottom-0 h-40 w-full bg-gradient-to-b from-transparent to-black" />

            {/* bubbleTransition */}
            <BubbleSpam />
        </section>
    );
};

export default Lorem2;
