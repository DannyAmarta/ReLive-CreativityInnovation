import { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
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
      // If Spoonacular uses subdomains for images, add this too:
      {
        protocol: 'https',
        hostname: 'img.spoonacular.com',
      },
    ],
  },

  // 2. Your existing Webpack SVG config
  webpack(config) { // TypeScript now infers 'config' from NextConfig
    const fileLoaderRule = config.module.rules.find((rule: any) =>
      rule.test?.test?.(".svg")
    );

    if (!fileLoaderRule) return config; // Safety check

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

    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },

  // 3. Your existing optimization settings
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