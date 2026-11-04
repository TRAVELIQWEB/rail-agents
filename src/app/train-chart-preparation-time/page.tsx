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
    canonical: PAGE_SLUG,
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
    <div className="flex min-h-screen flex-col bg-[#fdfbf7] text-stone-900">
      <Header />

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-orange-100 bg-gradient-to-b from-white via-white to-orange-50/70 py-8 sm:py-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[500px] rounded-full bg-gradient-to-br from-orange-200/30 via-amber-100/15 to-transparent blur-3xl"
          />

          <div className="site-container relative z-10">
            <div className="mx-auto max-w-5xl text-center">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3 py-1 text-xs font-semibold tracking-wide text-orange-700 shadow-sm">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Indian Railways charting guide
              </p>
              <h1 className="text-3xl font-extrabold leading-[1.08] tracking-tight text-[#0b2240] sm:text-4xl lg:text-5xl">
                Train Chart <span className="text-[var(--primary)]">Preparation Time</span>
              </h1>
              <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Find the first and final reservation chart times for your train and boarding station.
              </p>
            </div>
          </div>
        </section>

        {/* Dedicated Chart Preparation Component */}
        <section
          aria-label="IRCTC Train Chart Preparation Time"
          className="relative py-6 sm:py-8 lg:py-10 bg-gradient-to-b from-orange-50/40 via-[#faf8f4] to-[#fdfbf7] pb-14 lg:pb-12"
        >
          <div className="site-container relative px-2 sm:px-4">
            <TrainChartPreparationTime />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

