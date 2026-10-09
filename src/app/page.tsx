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
  title: "Railway Agent Guidance, IRCTC Help & Video Guides",
  description:
    "Explore practical railway agent guidance, IRCTC registration information, ticket booking help, and video tutorials from RailAgents.",
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: "Railway Agent Guidance, IRCTC Help & Video Guides | RailAgents",
    description:
      "Explore practical railway agent guidance, IRCTC registration information, ticket booking help, and video tutorials from RailAgents.",
    url: siteConfig.url,
    images: [siteConfig.socialImage],
  },
  twitter: {
    title: "Railway Agent Guidance, IRCTC Help & Video Guides | RailAgents",
    description:
      "Explore practical railway agent guidance, IRCTC registration information, ticket booking help, and video tutorials from RailAgents.",
    images: [siteConfig.socialImage],
  },
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
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
