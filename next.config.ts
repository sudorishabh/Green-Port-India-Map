import type { NextConfig } from "next";

// Same defaults helmet applied to the old Express API (CSP disabled).
// Scoped to /api: `Referrer-Policy: no-referrer` on pages would break the
// referrer-restricted Google Maps key.
const apiSecurityHeaders = [
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "Referrer-Policy", value: "no-referrer" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Download-Options", value: "noopen" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "X-XSS-Protection", value: "0" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sustainable-map-store.s3.ap-south-1.amazonaws.com",
        port: "",
        pathname: "/**",
        // pathname: "/account123/**",
        search: "",
      },
    ],
  },
  async headers() {
    return [{ source: "/api/:path*", headers: apiSecurityHeaders }];
  },
};

export default nextConfig;
