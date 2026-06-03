"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import Leaf1 from "@/public/assets/leaf/leaf1.png";
import Leaf2 from "@/public/assets/leaf/leaf2.png";
import Leaf3 from "@/public/assets/leaf/leaf3.png";
import Leaf4 from "@/public/assets/leaf/leaf4.png";
import Leaf5 from "@/public/assets/leaf/leaf5.png";
import Leaf6 from "@/public/assets/leaf/leaf6.png";
import Leaf7 from "@/public/assets/leaf/leaf7.png";
import Leaf8 from "@/public/assets/leaf/leaf8.png";
import Leaf9 from "@/public/assets/leaf/leaf9.png";
import Leaf10 from "@/public/assets/leaf/leaf10.png";
import Leaf11 from "@/public/assets/leaf/leaf11.png";
import Leaf12 from "@/public/assets/leaf/leaf12.png";
import Leaf13 from "@/public/assets/leaf/leaf13.png";
import Leaf14 from "@/public/assets/leaf/leaf14.png";
import Leaf15 from "@/public/assets/leaf/leaf15.png";
import Leaf16 from "@/public/assets/leaf/leaf16.png";
import Leaf17 from "@/public/assets/leaf/leaf17.png";
import Leaf18 from "@/public/assets/leaf/leaf18.png";
import Leaf19 from "@/public/assets/leaf/leaf19.png";
import Leaf20 from "@/public/assets/leaf/leaf20.png";
import Leaf21 from "@/public/assets/leaf/leaf21.png";
import Leaf22 from "@/public/assets/leaf/leaf22.png";
import Leaf23 from "@/public/assets/leaf/leaf23.png";
import Leaf24 from "@/public/assets/leaf/leaf24.png";
import Leaf25 from "@/public/assets/leaf/leaf25.png";

import Tree from "@/public/assets/wallpaper/tree3.png";
import Forest from "@/public/assets/wallpaper/forest3.png";
import Bench from "@/public/assets/wallpaper/bench2.png";
import Route from "@/public/assets/wallpaper/route2.png";

import Image from "next/image";

const MotionImage = motion(Image);

const leaves = [
    Leaf1,
    Leaf2,
    Leaf3,
    Leaf4,
    Leaf5,
    Leaf6,
    Leaf7,
    Leaf8,
    Leaf9,
    Leaf10,
    Leaf11,
    Leaf12,
    Leaf13,
    Leaf14,
    Leaf15,
    Leaf16,
    Leaf17,
    Leaf18,
    Leaf19,
    Leaf20,
    Leaf21,
    Leaf22,
    Leaf23,
    Leaf24,
    Leaf25,
];

const renderBatch = (batchDelay = 0) => {
    return leaves.map((leaf, index) => (
        <MotionImage
            key={`${batchDelay}-${index}`}
            src={leaf}
            alt="leaf"
            width={24 + Math.random() * 24}
            className="absolute overflow-hidden"
            initial={{ y: -100, x: `${Math.random() * 100}vw` }}
            animate={{
                y: "100vh",
                x: [
                    0,
                    (Math.random() - 0.5) * 40,
                    (Math.random() - 0.5) * 50,
                    (Math.random() - 0.5) * 60,
                    (Math.random() - 0.5) * 40,
                    0,
                ],
                rotate: [0, 90, 180, 270, 360],
            }}
            transition={{
                duration: 8 + Math.random() * 5,
                delay: batchDelay + Math.random() * 4,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    ));
};

const renderTreeLeaves = (batchDelay = 0) => {
    return leaves.map((leaf, index) => {
        const startX = `${65 + Math.random() * 35}vw`;

        const drift1 = 20 + Math.random() * 20;
        const drift2 = 40 + Math.random() * 40;
        const drift3 = 60 + Math.random() * 40;

        return (
            <MotionImage
                key={`tree-${batchDelay}-${index}`}
                src={leaf}
                alt="leaf"
                width={24 + Math.random() * 24}
                className="absolute z-15 overflow-hidden"
                initial={{
                    y: Math.random() * 120,
                    x: startX,
                }}
                animate={{
                    y: "100vh",
                    x: [
                        startX,
                        `calc(${startX} - ${drift1}px)`,
                        `calc(${startX} - ${drift2}px)`,
                        `calc(${startX} - ${drift3}px)`,
                    ],
                    rotate: [0, 90, 180, 270, 360],
                }}
                transition={{
                    duration: 8 + Math.random() * 4,
                    delay: batchDelay + Math.random() * 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        );
    });
};

const FallingLeaves = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-15">
            <div className="absolute bottom-0 w-full h-full z-18">
                <Image
                    src={Bench}
                    alt="bench"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="absolute bottom-0 left-0 h-full z-20">
                <Image
                    src={Forest}
                    alt="Forest"
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="hidden xl:block absolute bottom-0 right-0 z-20 h-screen overflow-hidden">
                <Image
                    src={Tree}
                    alt="Tree"
                    className="h-full w-auto max-w-none object-contain"
                />
            </div>

            {mounted && (
                <>
                    <div className="absolute inset-0 z-18 overflow-hidden hidden xl:block">
                        {renderTreeLeaves(1)}
                        {renderTreeLeaves(1)}
                        {/* {renderTreeLeaves(1)} */}
                    </div>

                    <div className="fixed inset-0 z-25 overflow-hidden">
                        {renderBatch(0)}
                        {/* {renderBatch(3)} */}
                        {/* {renderBatch(6)} */}
                        {/* {renderBatch(9)} */}
                    </div>
                </>
            )}
        </div>
    );
};

export default FallingLeaves;
