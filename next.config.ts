import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: "/fare-calculator",
        destination: "/train-ticket-agent-fare-calculator",
        permanent: true,
      },
      {
        source: "/irctc-ticket-date-calculator",
        destination: "/ticket-date-calculator",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/terms",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
