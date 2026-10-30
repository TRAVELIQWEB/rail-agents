import { QueryPage } from "@/components/ui/QueryPage";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Contact",
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
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${siteConfig.url}/contact#webpage`,
        url: `${siteConfig.url}/contact`,
        name: "Contact RailAgents",
        description:
          "Contact RailAgents with questions about IRCTC information, rail journeys, or other travel topics, including bus, air, and hotel travel.",
        isPartOf: { "@id": `${siteConfig.url}/#website` },
        breadcrumb: { "@id": `${siteConfig.url}/contact#breadcrumb` },
        inLanguage: "en-IN",
        mainEntity: {
          "@id": `${siteConfig.url}/#organization`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${siteConfig.url}/contact#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Contact", item: `${siteConfig.url}/contact` },
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
