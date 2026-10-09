import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { siteConfig } from "@/config/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[var(--background)] text-[var(--navy)]">
        {children}
        <FloatingWhatsApp />
      </body>
    </html>
  );
}
