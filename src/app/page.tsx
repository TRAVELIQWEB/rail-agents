import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { PopularToolsSection } from "@/components/home/PopularToolsSection";
import { ExploreTopicsSection } from "@/components/home/ExploreTopicsSection";
import { FeaturedGuidesSection } from "@/components/home/FeaturedGuidesSection";
import { WhyRailAgentsSection } from "@/components/home/WhyRailAgentsSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { VideoGuidesSection } from "@/components/home/VideoGuidesSection";
import { AskNihalSection } from "@/components/home/AskNihalSection";
import { LatestUpdatesSection } from "@/components/home/LatestUpdatesSection";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export const metadata = {
  title: {
    absolute: "RailAgents | Railway Agent Guidance, Live Status & IRCTC Tools",
  },
  description:
    "Explore practical railway agent guidance, live train running status, PNR status check, IRCTC calculators, and step-by-step booking tutorials on RailAgents.",
  alternates: {
    canonical: `${siteConfig.url}/`,
  },
  openGraph: {
    type: "website" as const,
    title: "RailAgents | Railway Agent Guidance, Live Status & IRCTC Tools",
    description:
      "Explore practical railway agent guidance, live train running status, PNR status check, IRCTC calculators, and step-by-step booking tutorials on RailAgents.",
    url: `${siteConfig.url}/`,
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "RailAgents | Railway Agent Guidance, Live Status & IRCTC Tools",
    description:
      "Explore practical railway agent guidance, live train running status, PNR status check, IRCTC calculators, and step-by-step booking tutorials on RailAgents.",
    images: [siteConfig.socialImage],
  },
};

// Homepage structured data
const homePageSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/#webpage`,
      url: `${siteConfig.url}/`,
      name: "RailAgents | Railway Agent Guidance, Live Status & IRCTC Tools",
      description:
        "Explore practical railway agent guidance, live train running status, PNR status check, IRCTC calculators, and step-by-step booking tutorials on RailAgents.",
      isPartOf: {
        "@id": `${siteConfig.url}/#website`,
      },
      about: {
        "@id": `${siteConfig.url}/#organization`,
      },
      inLanguage: "en-IN",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteConfig.url}/#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteConfig.url}/`,
        },
      ],
    },
  ],
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homePageSchema).replace(/</g, "\\u003c"),
        }}
      />

      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Most-Used Railway Tools */}
        <PopularToolsSection />

        {/* 3. Explore Railway Topics */}
        <ExploreTopicsSection />

        {/* 4. Featured Railway Guides */}
        <FeaturedGuidesSection />

        {/* 5. Why RailAgents Value Pillars */}
        <WhyRailAgentsSection />

        {/* 6. How It Works (3-step workflow) */}
        <HowItWorksSection />

        {/* 7. YouTube Video Guides */}
        <VideoGuidesSection />

        {/* 8. Ask a Question / Digital Persona Desk */}
        <AskNihalSection />

        {/* 9. Latest Railway Updates & Circulars */}
        <LatestUpdatesSection />
      </main>

      <Footer />
    </div>
  );
}
