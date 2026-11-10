import { AllToolsLink } from "@/components/tools/AllToolsLink";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TrainChartPreparationTime } from "@/components/calculator/TrainChartPreparationTime";
import { siteConfig } from "@/config/site";

const PAGE_SLUG = "/train-chart-preparation-time";
const PAGE_URL = `${siteConfig.url}${PAGE_SLUG}`;

export const metadata: Metadata = {
  title: {
    absolute:
      "IRCTC Train Chart Preparation Time – Station-Wise 1st & 2nd Chart Timing | RailAgents",
  },
  description:
    "Check API-reported first and final reservation chart timings and chart preparation stations for your selected train and boarding stop.",
  alternates: {
    canonical: PAGE_URL,
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

export default function TrainChartPreparationTimePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA] text-[#26374A]">
      <Header />

      <main className="flex-1">
        <AllToolsLink />
        <section className="compact-tool-heading border-b border-[#E5EAF0] bg-white py-3 sm:py-4">
          <div className="site-container">
            <div>
              <h1 className="text-xl font-extrabold leading-tight tracking-tight text-[#102B46] sm:text-2xl">
                Train Chart <span className="text-[var(--primary)]">Preparation Time</span>
              </h1>
              <p className="mt-1 text-xs leading-relaxed text-[#64748B]">
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
            <TrainChartPreparationTime />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

