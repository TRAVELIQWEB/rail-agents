import { QueryPage } from "@/components/ui/QueryPage";
import { siteConfig } from "@/config/site";

export const metadata = {
  title: "Contact RailAgents - Support & Railway Guidance Desk",
  description:
    "Contact RailAgents for assistance with railway agent registration, IRCTC compliance rules, ticket booking inquiries, and passenger travel guidance.",
  alternates: { canonical: `${siteConfig.url}/contact` },
  openGraph: {
    title: "Contact RailAgents - Support & Railway Guidance Desk | RailAgents",
    description:
      "Contact RailAgents for assistance with railway agent registration, IRCTC compliance rules, ticket booking inquiries, and passenger travel guidance.",
    url: `${siteConfig.url}/contact`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact RailAgents - Support & Railway Guidance Desk | RailAgents",
    description:
      "Contact RailAgents for assistance with railway agent registration, IRCTC compliance rules, ticket booking inquiries, and passenger travel guidance.",
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
        name: "Contact RailAgents - Support & Railway Guidance Desk",
        description:
          "Contact RailAgents for assistance with railway agent registration, IRCTC compliance rules, ticket booking inquiries, and passenger travel guidance.",
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
          { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/` },
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
      <QueryPage mode="contact" />
    </>
  );
}
