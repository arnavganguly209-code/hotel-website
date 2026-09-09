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
    // Orbit hero videos can be large; nginx must also allow this (client_max_body_size).
    serverActions: {
      bodySizeLimit: "200mb",
    },
    middlewareClientMaxBodySize: "200mb",
  },
  // Keep pdfkit/qrcode outside the bundler so AFM font data files resolve in production.
  serverExternalPackages: ["pdfkit", "qrcode"],
  async redirects() {
    return [
      // Legacy WordPress accommodation URLs (production VPS).
      {
        source: "/accommodation/deluxe-room",
        destination: "/rooms/deluxe-room",
        permanent: true,
      },
      {
        source: "/accommodation/super-deluxe-room",
        destination: "/rooms/super-deluxe-room",
        permanent: true,
      },
      {
        source: "/accommodation/family-room",
        destination: "/rooms/family-room",
        permanent: true,
      },
      {
        source: "/accommodation/super-deluxe-twin-room",
        destination: "/rooms/super-deluxe-twin-room",
        permanent: true,
      },
      {
        source: "/accommodation/:path*",
        destination: "/rooms/:path*",
        permanent: true,
      },
      {
        source: "/home/rooms",
        destination: "/rooms",
        permanent: true,
      },
      {
        source: "/home/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/rooms-suites",
        destination: "/rooms",
        permanent: true,
      },
      {
        source: "/about-us",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/our-gallery",
        destination: "/gallery",
        permanent: true,
      },
      {
        source: "/terms-conditions",
        destination: "/legal/terms",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/articles",
        permanent: true,
      },
      {
        source: "/service",
        destination: "/meetings-events",
        permanent: true,
      },
      {
        source: "/product/paynow",
        destination: "/book",
        permanent: true,
      },
      {
        source: "/restaurant",
        destination: "/dining",
        permanent: true,
      },
      {
        source: "/restaurant/:path*",
        destination: "/dining/:path*",
        permanent: true,
      },
      // Legacy WordPress/CMS URLs still indexed in Google Search Console.
      {
        source: "/accommodation-facility",
        destination: "/",
        permanent: true,
      },
      {
        source: "/accommodation-facility/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/legal/privacy",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/legal/terms",
        permanent: true,
      },
      {
        source: "/legal/refund",
        destination: "/legal/cancellation",
        permanent: true,
      },
      {
        source: "/meetings-weddings",
        destination: "/meetings-events",
        permanent: true,
      },
      {
        source: "/legal",
        destination: "/legal/privacy",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/media/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        // Short TTL so Orbit delete/replace never serves stale media from CDN/browser.
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=60, must-revalidate",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        source: "/apple-touch-icon.png",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
      {
        source: "/brand/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
