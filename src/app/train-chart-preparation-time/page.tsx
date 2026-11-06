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
    "Check exact station-wise IRCTC reservation chart preparation timings (First Chart, Second Final Chart, and Remote Charting Station) for any Indian Railways train by number or name.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title:
      "IRCTC Train Chart Preparation Time – Station-Wise 1st & 2nd Chart Timing | RailAgents",
    description:
      "Check exact station-wise IRCTC reservation chart preparation timings (First Chart, Second Final Chart, and Remote Charting Station) for any Indian Railways train.",
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
        <section className="border-b border-[#E5EAF0] bg-white py-7 sm:py-9">
          <div className="site-container">
            <div className="mx-auto max-w-5xl text-center">
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E87535]/25 bg-[#FFF5EF] px-3 py-1 text-xs font-semibold tracking-wide text-[#A34C22]">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#E87535]" />
                Indian Railways charting guide
              </p>
              <h1 className="text-3xl font-extrabold leading-[1.08] tracking-tight text-[#102B46] sm:text-4xl lg:text-5xl">
                Train Chart <span className="text-[var(--primary)]">Preparation Time</span>
              </h1>
              <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-[#64748B] sm:text-base">
                Find the first and final reservation chart times for your train and boarding station.
              </p>
            </div>
          </div>
        </section>

        {/* Dedicated Chart Preparation Component */}
        <section
          aria-label="IRCTC Train Chart Preparation Time"
          className="bg-[#F5F7FA] py-6 pb-12 sm:py-8 lg:py-9"
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

