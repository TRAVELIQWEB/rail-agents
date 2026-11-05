import { QueryPage } from "@/components/ui/QueryPage";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Ask Nihal Singh - Railway Questions & Travel Guidance",
  description:
    "Ask Nihal Singh for straightforward guidance on railway booking rules, IRCTC agent queries, ticket confirmation, and passenger travel.",
  alternates: { canonical: `${siteConfig.url}/ask-nihal` },
  openGraph: {
    title: "Ask Nihal Singh - Railway Questions & Travel Guidance | RailAgents",
    description:
      "Ask Nihal Singh for straightforward guidance on railway booking rules, IRCTC agent queries, ticket confirmation, and passenger travel.",
    url: `${siteConfig.url}/ask-nihal`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ask Nihal Singh - Railway Questions & Travel Guidance | RailAgents",
    description:
      "Ask Nihal Singh for straightforward guidance on railway booking rules, IRCTC agent queries, ticket confirmation, and passenger travel.",
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
          "@id": `${siteConfig.url}/#organization`,
        },
        about: {
          "@type": "Brand",
          "@id": `${siteConfig.url}/about#nihal-singh`,
          name: "Nihal Singh",
          description: "Nihal Singh is a fictional digital character representing RailAgents.",
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
      <QueryPage mode="ask-nihal" />
    </>
  );
}
