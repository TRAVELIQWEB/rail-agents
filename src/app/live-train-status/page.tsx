import type { Metadata } from "next";
import { Suspense } from "react";
import { LiveTrainStatusTool } from "@/components/LiveTrainStatusTool";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Live Train Running Status - Live Train Location & Delay Tracker",
  description:
    "Track live train running status, real-time train location, station arrival and departure times, platform numbers, and train delays online with RailAgents.",
  alternates: {
    canonical: `${siteConfig.url}/live-train-status`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Live Train Running Status - Live Train Location & Delay Tracker | RailAgents",
    description:
      "Track live train running status, real-time train location, station arrival and departure times, platform numbers, and train delays online with RailAgents.",
    url: `${siteConfig.url}/live-train-status`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "Live Train Running Status - RailAgents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Train Running Status - Live Train Location & Delay Tracker | RailAgents",
    description:
      "Track live train running status, real-time train location, station arrival and departure times, platform numbers, and train delays online with RailAgents.",
    images: [siteConfig.socialImage],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteConfig.url}/live-train-status#webapp`,
      name: "RailAgents Live Train Running Status",
      url: `${siteConfig.url}/live-train-status`,
      applicationCategory: "TravelApplication",
      operatingSystem: "All",
      description:
        "Track live train running status, real-time GPS location, station timetables, and delay status online.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
      publisher: {
        "@id": `${siteConfig.url}/#organization`,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteConfig.url}/live-train-status#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteConfig.url}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Live Train Status",
          item: `${siteConfig.url}/live-train-status`,
        },
      ],
    },
  ],
};

export default function LiveTrainStatusPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Suspense fallback={<LiveTrainStatusFallback />}>
        <LiveTrainStatusTool />
      </Suspense>
    </>
  );
}

function LiveTrainStatusFallback() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fffdfa] text-[var(--navy)]">
      <Header />
      <main className="flex-1">
        <section className="border-b border-[#f4e4d4] bg-gradient-to-b from-[#fffcf8] to-[#f6efe6] px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto w-full max-w-[1240px] text-center">
            <h1 className="page-hero-title">Live Train <span className="hero-accent">Running Status</span></h1>
            <p className="page-hero-description mx-auto mt-2 max-w-xl">Check real-time train location, delay status, platform numbers, and station timetables.</p>
          </div>
        </section>
        <div aria-busy="true" aria-label="Loading live train status tool" className="mx-auto w-full max-w-[1240px] space-y-4 px-4 py-6 sm:px-6">
          <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5"><div className="h-5 w-64 max-w-full rounded bg-slate-200" /><div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="h-11 rounded-lg bg-slate-100" /><div className="h-11 rounded-lg bg-slate-100" /><div className="h-11 rounded-lg bg-orange-100" /></div></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
