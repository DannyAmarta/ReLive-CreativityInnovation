import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  // 0. Redirects: legacy routes that have been merged or removed
  async redirects() {
    return [
      {
        source: '/client/calendar',
        destination: '/client/dashboard',
        permanent: true,
      },
    ];
  },

  // 1. Add your Image Domains here
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'spoonacular.com',
      },
      {
        protocol: 'https',
        hostname: 'www.themealdb.com',
      },
      {
        protocol: 'https',
        hostname: 'img.spoonacular.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
    ],
  },

  // 2. Turbopack config (empty silences the webpack vs turbopack conflict warning)
  turbopack: {},

  // 3. Your existing Webpack SVG config (used in webpack mode only)
  webpack(config) {
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.(".svg")
    );

    if (!fileLoaderRule) return config;

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/,
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not || []), /url/] },
        use: ["@svgr/webpack"],
      }
    );

    config.resolve.fallback = {
      ...config.resolve.fallback,
      "pino-pretty": false,
      "lokijs": false,
      "encoding": false,
    };

    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },

  // 4. Optimization settings
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "lucide-react",
      "@tsparticles/engine",
      "@tsparticles/react",
      "@tsparticles/slim",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "@babylonjs/core",
    ],
  },
};

export default nextConfig;
