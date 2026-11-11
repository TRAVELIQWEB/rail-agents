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
  async headers() {
    return [
      ...["/admin/:path*", "/api/admin/:path*", "/api/trains/:path*", "/api/pnr/:path*", "/api/charting", "/api/stations", "/api/posts/:path*", "/api/upload", "/api/irctc-cancellation-refund"].map((source) => ({
        source,
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }],
      })),
      {
        source: "/pnr-status",
        headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
      },
    ];
  },
  async redirects() {
    return [
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
        source: "/ticket-booking-date-calculator",
        destination: "/ticket-date-calculator",
        permanent: true,
      },
      {
        source: "/terms-and-conditions",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/privacy",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/privacy-policy",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/disclaimer",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/live-status",
        destination: "/live-train-status",
        permanent: true,
      },
      {
        source: "/live-train",
        destination: "/live-train-status",
        permanent: true,
      },
      {
        source: "/pnr",
        destination: "/pnr-status",
        permanent: true,
      },
      {
        source: "/agent-registration",
        destination: "/irctc-agent-registration",
        permanent: true,
      },
      {
        source: "/irctc-agent",
        destination: "/irctc-agent-registration",
        permanent: true,
      },
      {
        source: "/irctc-rules",
        destination: "/irctc-agent-rules-regulations",
        permanent: true,
      },
      {
        source: "/cancellation-calculator",
        destination: "/irctc-cancellation-refund-calculator",
        permanent: true,
      },
      {
        source: "/refund-calculator",
        destination: "/irctc-cancellation-refund-calculator",
        permanent: true,
      },
      {
        source: "/chart-timing",
        destination: "/train-chart-preparation-time",
        permanent: true,
      },
      {
        source: "/chart-preparation",
        destination: "/train-chart-preparation-time",
        permanent: true,
      },
      // Legacy article URLs -> redirect to closest relevant page/tool (while /refund-process-for-wrong-mobile-number serves a dedicated restored page)
      {
        source: "/tatkal-ticket-booking-timings-change-irctc",
        destination: "/guides/tatkal-booking-guide-agents",
        permanent: true,
      },
      {
        source: "/irctc-online-ticket-booking-convenience-fees",
        destination: "/train-ticket-agent-fare-calculator",
        permanent: true,
      },
      {
        source: "/indian-railways-ticket-booking-diwali-2025",
        destination: "/ticket-date-calculator",
        permanent: true,
      },
      {
        source: "/indian-railways-new-trains-bihar-2025",
        destination: "/live-train-status",
        permanent: true,
      },
      // Legacy WordPress category and team paths -> permanent redirect to relevant HTML sections
      // Note: Do NOT redirect missing /wp-content/* or /wp-includes/* CSS/JS/image files to HTML pages
      {
        source: "/category/train",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/category/irctc",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/category/:path*",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/team-category/developer",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/team-category/:path*",
        destination: "/about",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
