"use client";

import dynamic from "next/dynamic";

export const LazySkyComponent = dynamic(
    () => import("./LandingSky"),
    {
        ssr: false,
        loading: () => (
            <div className="relative h-screen w-full bg-gradient-to-b from-sky-200 to-sky-400" />
        ),
    }
);
