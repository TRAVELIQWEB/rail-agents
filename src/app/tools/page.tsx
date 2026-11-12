import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { legacyToolDestination } from "@/lib/tool-navigation";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { RailwayToolsWorkspace } from "@/components/tools/RailwayToolsWorkspace";
import styles from "@/components/tools/ToolsDirectory.module.css";
import { railTools } from "@/config/tools";
import { siteConfig } from "@/config/site";

const OVERVIEW_TITLE = "Free Railway Tools — Live Train, PNR, Fare & Refund";
const OVERVIEW_FULL_TITLE = `${OVERVIEW_TITLE} | RailAgents`;
const OVERVIEW_DESCRIPTION =
  "Access free railway tools to check live train status, PNR, ticket fares, cancellation refunds, booking dates and chart preparation.";

type ToolsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  searchParams,
}: ToolsPageProps): Promise<Metadata> {
  const resolvedParams = searchParams ? await searchParams : {};
  const hasToolWorkspaceState = Boolean(
    resolvedParams.tool || resolvedParams.pnr || resolvedParams.lookup,
  );

  return {
    title: OVERVIEW_TITLE,
    description: OVERVIEW_DESCRIPTION,
    alternates: {
      canonical: `${siteConfig.url}/tools`,
    },
    robots: hasToolWorkspaceState
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
    openGraph: {
      title: OVERVIEW_FULL_TITLE,
      description: OVERVIEW_DESCRIPTION,
      url: `${siteConfig.url}/tools`,
      siteName: siteConfig.name,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: siteConfig.socialImage,
          width: 1200,
          height: 630,
          alt: OVERVIEW_FULL_TITLE,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: OVERVIEW_FULL_TITLE,
      description: OVERVIEW_DESCRIPTION,
      images: [siteConfig.socialImage],
    },
  };
}

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${siteConfig.url}/tools#webpage`,
      url: `${siteConfig.url}/tools`,
      name: OVERVIEW_FULL_TITLE,
      description: OVERVIEW_DESCRIPTION,
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      about: { "@id": `${siteConfig.url}/#organization` },
      inLanguage: "en-IN",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: railTools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.shortTitle,
          url: `${siteConfig.url}${tool.href}`,
        })),
      },
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
      className="mx-auto w-full max-w-[1240px] px-4 py-8"
    >
      <div className="min-w-0">
        <div className="h-6 w-52 rounded bg-slate-200" />
        <div className="mt-2 h-4 w-full max-w-80 rounded bg-slate-100" />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-40 rounded-xl bg-slate-50" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function ToolsPage({ searchParams }: ToolsPageProps) {
  const params = searchParams ? await searchParams : {};
  if ("tool" in params || "pnr" in params || "lookup" in params) {
    redirect(legacyToolDestination(params));
  }
  return (
    <div className="flex flex-col bg-[#FFFFFF]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Header />
      <main id="main-content" tabIndex={-1} className={styles.workspace}>
        <div className="tools-workspace-container mt-2 sm:mt-3.5 lg:mt-4 py-6">
          <div className={styles.pageIntro}>
            <h1 id="railway-tools-title">Railway Tools &amp; Calculators</h1>
            <p>Live train status, PNR checks, fares and booking tools in one place.</p>
          </div>
          <Suspense fallback={<ToolsWorkspaceFallback />}>
            <RailwayToolsWorkspace />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
