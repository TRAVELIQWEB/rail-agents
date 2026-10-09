import { QueryPage } from "@/components/ui/QueryPage";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Contact RailAgents",
  description:
    "Contact RailAgents for help finding railway agent guides, IRCTC information, and railway service resources.",
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    title: "Contact RailAgents",
    description:
      "Contact RailAgents for help finding railway agent guides, IRCTC information, and railway service resources.",
    url: `${siteConfig.url}/contact`,
    images: [siteConfig.socialImage],
  },
  twitter: {
    title: "Contact RailAgents",
    description:
      "Contact RailAgents for help finding railway agent guides, IRCTC information, and railway service resources.",
    images: [siteConfig.socialImage],
  },
};

export default function ContactPage() {
  return (
    <QueryPage />
  );
}
