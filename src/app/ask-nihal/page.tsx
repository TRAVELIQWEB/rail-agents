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
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${siteConfig.url}/ask-nihal#webpage`,
        url: `${siteConfig.url}/ask-nihal`,
        name: "Ask Nihal Singh About Railway Services | RailAgents",
        description:
          "Ask Nihal Singh for guidance on railway agent registration, IRCTC information, booking questions, and railway services.",
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        breadcrumb: { "@id": `${siteConfig.url}/ask-nihal#breadcrumb` },
        inLanguage: "en-IN",
        mainEntity: {
          "@id": `${siteConfig.url}/about#nihal-singh`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteConfig.url}/ask-nihal#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Ask Nihal", item: `${siteConfig.url}/ask-nihal` },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <QueryPage />
    </>
  );
}
