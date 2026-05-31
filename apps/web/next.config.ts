import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Relaxed CSP for dev (Next.js needs eval for hot reload)
  {
    key: "Content-Security-Policy",
    value: isDev
      ? "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:;"
      : [
          "default-src 'self'",
          "script-src 'self' 'strict-dynamic' https://checkout.razorpay.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https: https://images.unsplash.com",
          "connect-src 'self' https://api.razorpay.com https://*.algolia.net https://*.algolianet.com",
          "frame-src https://api.razorpay.com https://ext.digio.in",
          "media-src 'self' https:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "upgrade-insecure-requests",
        ].join("; "),
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ["@roomly/types", "@roomly/utils"],

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "*.cloudfront.net" },
      { protocol: "https", hostname: "*.amazonaws.com" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      // Cache static assets aggressively
      {
        source: "/_next/static/(.*)",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },

  async redirects() {
    return [
      // Redirect legacy /pgs to /search
      { source: "/pgs", destination: "/search", permanent: true },
      { source: "/pgs/:path*", destination: "/search", permanent: true },
    ];
  },

  poweredByHeader: false,

  logging: {
    fetches: { fullUrl: isDev },
  },
};

export default nextConfig;
