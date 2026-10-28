import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { siteConfig } from "@/config/site";
import "./globals.css";
import { GoogleTagManager } from "@next/third-parties/google";

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
      url: siteConfig.url,
      logo: `${siteConfig.url}/logo.svg`,
      sameAs: [siteConfig.social.youtube, siteConfig.social.instagram].filter(
        Boolean,
      ),
    },
    {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      url: siteConfig.url,
      name: siteConfig.name,
      inLanguage: "en-IN",
      publisher: { "@id": `${siteConfig.url}/#organization` },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "RailAgents | Railway Agent Guidance & IRCTC Resources",
    template: "%s | RailAgents",
  },
  description:
    "Clear railway agent guidance, IRCTC agent information, and practical resources for railway services from RailAgents.",
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: "RailAgents | Railway Agent Guidance & IRCTC Resources",
    description:
      "Clear railway agent guidance, IRCTC agent information, and practical resources for railway services from RailAgents.",
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
    title: "RailAgents | Railway Agent Guidance & IRCTC Resources",
    description:
      "Clear railway agent guidance, IRCTC agent information, and practical resources for railway services from RailAgents.",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <FloatingWhatsApp />
        <GoogleTagManager gtmId="GTM-P3CML7MM" />
      </body>
    </html>
  );
}
