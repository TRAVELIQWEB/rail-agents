
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { FeaturedServices } from "@/components/home/FeaturedServices";
import { ExploreTopics } from "@/components/home/ExploreTopics";
import { LatestVideos } from "@/components/home/LatestVideos";
import { WhyAndHow } from "@/components/home/WhyAndHow";
import { Testimonials } from "@/components/home/Testimonials";
import { FinalAskCta } from "@/components/home/FinalAskCta";
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
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homePageSchema).replace(/</g, "\\u003c"),
        }}
      />

      <Header />

      <main className="flex-1">
        <Hero />
        <FeaturedServices />
        <ExploreTopics />
        <WhyAndHow />
        <LatestVideos />
        <Testimonials />
        <FinalAskCta />
      </main>

      <Footer />
    </div>
  );
}
