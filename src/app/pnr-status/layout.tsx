import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "PNR Status Check - Live Railway Ticket & Passenger Status",
  description:
    "Check live 10-digit Indian Railway PNR status, coach and berth confirmation, RAC/WL waitlist updates, and chart preparation timings on RailAgents.",
  alternates: {
    canonical: `${siteConfig.url}/pnr-status`,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "PNR Status Check - Live Railway Ticket & Passenger Status | RailAgents",
    description:
      "Check live 10-digit Indian Railway PNR status, coach and berth confirmation, RAC/WL waitlist updates, and chart preparation timings on RailAgents.",
    url: `${siteConfig.url}/pnr-status`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "PNR Status Check - RailAgents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PNR Status Check - Live Railway Ticket & Passenger Status | RailAgents",
    description:
      "Check live 10-digit Indian Railway PNR status, coach and berth confirmation, RAC/WL waitlist updates, and chart preparation timings on RailAgents.",
    images: [siteConfig.socialImage],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${siteConfig.url}/pnr-status#webapp`,
      name: "RailAgents PNR Status Check",
      url: `${siteConfig.url}/pnr-status`,
      applicationCategory: "TravelApplication",
      operatingSystem: "All",
      description:
        "Check live 10-digit Indian Railway PNR status, coach and berth confirmation, and RAC/WL waitlist updates on RailAgents.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "INR",
      },
      publisher: {
        "@id": `${siteConfig.url}/#organization`,
      },
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteConfig.url}/pnr-status#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${siteConfig.url}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "PNR Status",
          item: `${siteConfig.url}/pnr-status`,
        },
      ],
    },
  ],
};

export default function PnrStatusLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      {children}
    </>
  );
}
