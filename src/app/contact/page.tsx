import { QueryPage } from "@/components/ui/QueryPage";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Contact RailAgents",
  description:
    "Contact RailAgents with questions about IRCTC information, rail journeys, or other travel topics, including bus, air, and hotel travel.",
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    title: "Contact RailAgents",
    description:
      "Contact RailAgents with questions about IRCTC information, rail journeys, or other travel topics, including bus, air, and hotel travel.",
    url: `${siteConfig.url}/contact`,
    images: [siteConfig.socialImage],
  },
  twitter: {
    title: "Contact RailAgents",
    description:
      "Contact RailAgents with questions about IRCTC information, rail journeys, or other travel topics, including bus, air, and hotel travel.",
    images: [siteConfig.socialImage],
  },
};

export default function ContactPage() {
  return (
    <QueryPage />
  );
}
