import type { NextConfig } from "next";

// Same defaults helmet applied to the old Express API (CSP disabled).
// Scoped to /api, the routes the Express API served, so pages keep the
// browser's defaults.
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

// Stops other sites from framing the admin portal (clickjacking). The public
// map at / stays frameable so it can still be embedded elsewhere.
const portalSecurityHeaders = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/api/:path*", headers: apiSecurityHeaders },
      // Also matches /portal itself.
      { source: "/portal/:path*", headers: portalSecurityHeaders },
    ];
  },
};

export default nextConfig;
