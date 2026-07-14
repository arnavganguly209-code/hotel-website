import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Hostinger VPS: serve local /public files directly (no optimizer).
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
    minimumCacheTTL: 60,
  },
  experimental: {
    // Orbit image uploads up to 10MB (App Router / Server Actions).
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;
