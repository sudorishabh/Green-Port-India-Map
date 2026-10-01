import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["sustainable-map-store.s3.ap-south-1.amazonaws.com"],
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
};

export default nextConfig;
