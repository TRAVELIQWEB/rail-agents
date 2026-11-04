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
        {/* Compact & Clean Hero Header */}
        <section className="relative overflow-hidden border-b border-[#f2e6d9] bg-gradient-to-b from-[#fffcf8] via-[#faf5ee] to-[#f7f0e6] pt-4 pb-3.5 sm:pt-5 sm:pb-4 lg:pt-6 lg:pb-5">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-56 w-[500px] rounded-full bg-gradient-to-br from-orange-200/30 via-amber-100/15 to-transparent blur-3xl"
          />

          <div className="site-container relative z-10">
            <div className="mx-auto max-w-4xl text-center">
              <p className="inline-flex items-center gap-2 rounded-full border border-orange-200/90 bg-white/85 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-orange-800 shadow-2xs mb-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                RailAgents · PRS Charting Utility
              </p>
              <h1 className="text-xl sm:text-2xl lg:text-[1.95rem] font-extrabold text-[#0b2240] tracking-tight leading-tight">
                IRCTC Train{" "}
                <span className="text-[var(--primary)] whitespace-nowrap">
                  Chart Preparation Time
                </span>
              </h1>
              <p className="mx-auto mt-1 max-w-2xl text-[11.5px] sm:text-xs text-stone-600 leading-normal">
                Search any train by number or name, select your boarding station, and view exact First Chart, Second (Final) Chart, and Remote Quota station timings.
              </p>
            </div>
          </div>
        </section>

        {/* Dedicated Chart Preparation Component */}
        <section
          aria-label="IRCTC Train Chart Preparation Time"
          className="relative py-4 sm:py-6 lg:py-8 bg-gradient-to-b from-[#f7f0e6]/60 via-[#faf6f0] to-[#fdfbf7] pb-14 lg:pb-12"
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

