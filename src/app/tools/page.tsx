import { Suspense } from "react";
import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RailwayToolsWorkspace } from "@/components/tools/RailwayToolsWorkspace";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Railway Tools & Online Calculators",
  description:
    "Access free Indian Railways tools from RailAgents: Live Train Running Status, PNR Status Check, Ticket Booking Date Calculator, Train Fare Breakdown, and Chart Timings.",
  alternates: {
    canonical: `${siteConfig.url}/tools`,
  },
  openGraph: {
    title: "Railway Tools & Online Calculators | RailAgents",
    description:
      "Access free Indian Railways tools from RailAgents: Live Train Running Status, PNR Status Check, Ticket Booking Date Calculator, Train Fare Breakdown, and Chart Timings.",
    url: `${siteConfig.url}/tools`,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "Railway Tools & Online Calculators - RailAgents",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Railway Tools & Online Calculators | RailAgents",
    description:
      "Access free Indian Railways tools from RailAgents: Live Train Running Status, PNR Status Check, Ticket Booking Date Calculator, Train Fare Breakdown, and Chart Timings.",
    images: [siteConfig.socialImage],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${siteConfig.url}/tools#webpage`,
      url: `${siteConfig.url}/tools`,
      name: "Railway Tools & Online Calculators | RailAgents",
      description:
        "Access free Indian Railways tools from RailAgents: Live Train Running Status, PNR Status Check, Ticket Booking Date Calculator, Train Fare Breakdown, and Chart Timings.",
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      about: { "@id": `${siteConfig.url}/#organization` },
      inLanguage: "en-IN",
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${siteConfig.url}/tools#breadcrumb`,
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
          name: "Tools",
          item: `${siteConfig.url}/tools`,
        },
      ],
    },
  ],
};

function ToolsWorkspaceFallback() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-4 md:flex-row md:items-stretch md:gap-5 lg:gap-6"
    >
      <div className="hidden min-h-[520px] shrink-0 rounded-2xl border border-slate-200 bg-white p-3 md:block md:w-[215px] lg:w-[250px]">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="mt-3 space-y-2">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-9 rounded-lg bg-slate-100" />
          ))}
        </div>
      </div>
      <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="h-6 w-52 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-80 rounded bg-slate-100" />
        <div className="mt-5 h-32 rounded-xl bg-slate-50" />
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main className="flex-1 pb-6">
        <h1 className="sr-only">Railway Tools &amp; Online Calculators</h1>

        {/* Two-Column Railway Tools Workspace */}
        <div className="tools-workspace-container pt-3 sm:pt-4">
          <Suspense fallback={<ToolsWorkspaceFallback />}>
            <RailwayToolsWorkspace />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
