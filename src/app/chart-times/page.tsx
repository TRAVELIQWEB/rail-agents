import { ToolPageSchema } from "@/components/seo/ToolPageSchema";
import { AllToolsLink } from "@/components/tools/AllToolsLink";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TrainChartPreparationTime } from "@/components/calculator/TrainChartPreparationTime";
import { siteConfig } from "@/config/site";

const PAGE_URL = `${siteConfig.url}/train-chart-preparation-time`;

export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: {
    absolute:
      "IRCTC Train Chart Preparation Time – Station-Wise 1st & 2nd Chart Timing | RailAgents",
  },
  description:
    "Check API-reported first and final reservation chart timings and chart preparation stations for your selected train and boarding stop.",
  alternates: {
    canonical: PAGE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "IRCTC Train Chart Preparation Time | RailAgents",
    description: "Check API-reported first and final reservation chart timings and chart preparation stations for your selected train and boarding stop.",
    images: [siteConfig.socialImage],
  },
  openGraph: {
    title:
      "IRCTC Train Chart Preparation Time – Station-Wise 1st & 2nd Chart Timing | RailAgents",
    description:
      "Check API-reported first and final reservation chart timings and chart preparation stations for your selected train and boarding stop.",
    url: PAGE_URL,
    siteName: siteConfig.name,
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: siteConfig.socialImage,
        width: 1200,
        height: 630,
        alt: "IRCTC Train Chart Preparation Time – RailAgents",
      },
    ],
  },
};

export const dynamic = "force-dynamic";

export default function ChartTimesRootPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA] text-[#26374A]">
      <ToolPageSchema title="Train Chart Preparation Time" description="Check API-reported first and final reservation chart timings for your selected train and boarding stop." pathname="/train-chart-preparation-time" />
      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <AllToolsLink />
        <section className="compact-tool-heading border-b border-[#E5EAF0] bg-white py-3 sm:py-4">
          <div className="site-container">
            <div>
              <h1 className="type-page-title  tracking-tight text-[#102B46] ">
                Train Chart <span className="text-[var(--primary)]">Preparation Time</span>
              </h1>
              <p className="type-body-small mt-1 leading-relaxed text-[#64748B]">
                Check API-reported chart times and the chart preparation station for your boarding stop.
              </p>
            </div>
          </div>
        </section>

        {/* Dedicated Chart Preparation Component */}
        <section
          aria-label="IRCTC Train Chart Preparation Time"
          className="bg-[#F5F7FA] pt-3 pb-6"
        >
          <div className="w-full relative">
            <TrainChartPreparationTime basePath="/chart-times" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

