
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { ExploreTopics } from "@/components/home/ExploreTopics";
import { LatestVideos } from "@/components/home/LatestVideos";
import { WhyAndHow } from "@/components/home/WhyAndHow";
import { Testimonials } from "@/components/home/Testimonials";
import { FinalAskCta } from "@/components/home/FinalAskCta";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export const metadata = {
  title: {
    absolute: "Railway Agent Guidance, IRCTC Help & Video Guides | RailAgents",
  },
  description:
    "Explore practical railway agent guidance, IRCTC registration information, ticket booking help, and video tutorials from RailAgents.",
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: "website" as const,
    title: "Railway Agent Guidance, IRCTC Help & Video Guides | RailAgents",
    description:
      "Explore practical railway agent guidance, IRCTC registration information, ticket booking help, and video tutorials from RailAgents.",
    url: `${siteConfig.url}/`,
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "Railway Agent Guidance, IRCTC Help & Video Guides | RailAgents",
    description:
      "Explore practical railway agent guidance, IRCTC registration information, ticket booking help, and video tutorials from RailAgents.",
    images: [siteConfig.socialImage],
  },
};

// Homepage structured data
const homePageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${siteConfig.url}/#webpage`,
  url: `${siteConfig.url}/`,
  name: "Railway Agent Guidance, IRCTC Help & Video Guides | RailAgents",
  description:
    "Explore practical railway agent guidance, IRCTC registration information, ticket booking help, and video tutorials from RailAgents.",
  isPartOf: {
    "@id": `${siteConfig.url}/#website`,
  },
  about: {
    "@id": `${siteConfig.url}/#organization`,
  },
  inLanguage: "en-IN",
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
