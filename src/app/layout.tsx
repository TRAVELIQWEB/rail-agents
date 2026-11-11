import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#organization`,
      name: siteConfig.name,
      alternateName: ["RailAgents Platform", "Rail Agents"],
      url: siteConfig.url,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/icon.png`,
        width: 512,
        height: 512,
      },
      sameAs: [
        siteConfig.social.youtube,
        siteConfig.social.instagram,
        siteConfig.social.facebook,
      ].filter(Boolean),
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      alternateName: ["Rail Agents", "RailAgents.in"],
      inLanguage: "en-IN",
      description:
        "Indian Railways agent guidance, live train running status, PNR status check, and IRCTC tools.",
      publisher: { "@id": `${siteConfig.url}/#organization` },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "RailAgents | Railway Agent Guidance, Live Status & IRCTC Tools",
    template: "%s | RailAgents",
  },
  description:
    "Explore practical railway agent guidance, live train running status, PNR status check, IRCTC calculators, and step-by-step booking tutorials on RailAgents.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "RailAgents | Railway Agent Guidance, Live Status & IRCTC Tools",
    description:
      "Explore practical railway agent guidance, live train running status, PNR status check, IRCTC calculators, and step-by-step booking tutorials on RailAgents.",
    url: siteConfig.url,
    images: [
      {
        url: siteConfig.socialImage,
        alt: "RailAgents railway guidance with Nihal Singh",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RailAgents | Railway Agent Guidance, Live Status & IRCTC Tools",
    description:
      "Explore practical railway agent guidance, live train running status, PNR status check, IRCTC calculators, and step-by-step booking tutorials on RailAgents.",
    images: [siteConfig.socialImage],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-IN"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--navy)]">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <FloatingWhatsApp />
        <Suspense fallback={null}>
          <AnalyticsScripts />
        </Suspense>
      </body>
    </html>
  );
}
