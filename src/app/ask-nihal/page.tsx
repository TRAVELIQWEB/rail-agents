import { QueryPage } from "@/components/ui/QueryPage";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Ask Nihal Singh About Railway Services",
  description:
    "Ask Nihal Singh for guidance on railway agent registration, IRCTC information, booking questions, and railway services.",
  alternates: { canonical: `${siteConfig.url}/ask-nihal` },
  openGraph: {
    title: "Ask Nihal Singh About Railway Services | RailAgents",
    description:
      "Ask Nihal Singh for guidance on railway agent registration, IRCTC information, booking questions, and railway services.",
    url: `${siteConfig.url}/ask-nihal`,
    images: [siteConfig.socialImage],
  },
  twitter: {
    title: "Ask Nihal Singh About Railway Services | RailAgents",
    description:
      "Ask Nihal Singh for guidance on railway agent registration, IRCTC information, booking questions, and railway services.",
    images: [siteConfig.socialImage],
  },
};

export default function AskNihalPage() {
  return (
    <QueryPage />
  );
}
