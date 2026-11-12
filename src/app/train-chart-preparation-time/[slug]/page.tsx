import { AllToolsLink } from "@/components/tools/AllToolsLink";
import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TrainChartPreparationTime } from "@/components/calculator/TrainChartPreparationTime";
import { parseTrainSlug } from "@/lib/train-slug";
import { siteConfig } from "@/config/site";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ date?: string }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { date } = await searchParams;
  const { trainNumber, trainName } = parseTrainSlug(slug);

  const trainLabel = trainName ? `${trainNumber} ${trainName}` : `Train ${trainNumber}`;
  const dateSuffix = date ? ` for Journey Date ${date}` : "";
  const pageUrl = `${siteConfig.url}/train-chart-preparation-time/${slug}`;

  return {
    robots: date ? { index: false, follow: true } : { index: true, follow: true },
    twitter: {
      card: "summary_large_image",
      title: `${trainLabel} Chart Preparation Time | RailAgents`,
      description: `Check reservation chart timings and chart preparation stations for ${trainLabel}.`,
      images: [siteConfig.socialImage],
    },
    title: {
      absolute: `${trainLabel} Chart Preparation Time – 1st & Final Chart Schedule${dateSuffix} | RailAgents`,
    },
    description: `Check 1st and 2nd final reservation chart preparation timings, chart preparation station, and station-wise boarding schedule for ${trainLabel}${dateSuffix}.`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${trainLabel} Chart Preparation Time – 1st & 2nd Chart Timing | RailAgents`,
      description: `Check reservation chart preparation timings and chart preparation stations for ${trainLabel}.`,
      url: pageUrl,
      siteName: siteConfig.name,
      type: "website",
      locale: "en_IN",
      images: [
        {
          url: siteConfig.socialImage,
          width: 1200,
          height: 630,
          alt: `${trainLabel} Chart Preparation Time – RailAgents`,
        },
      ],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function TrainChartPrepSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { date } = await searchParams;
  const { trainNumber, trainName } = parseTrainSlug(slug);

  return (
    <div className="flex min-h-screen flex-col bg-[#F5F7FA] text-[#26374A]">
      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1">
        <AllToolsLink />
        <section className="compact-tool-heading border-b border-[#E5EAF0] bg-white py-3 sm:py-4">
          <div className="site-container">
            <div>
              <h1 className="type-page-title  tracking-tight text-[#102B46] ">
                {trainNumber ? (
                  <>
                    <span className="text-[var(--primary)]">{trainNumber}</span> {trainName ? `${trainName} ` : ""}Chart Preparation Time
                  </>
                ) : (
                  <>
                    Train Chart <span className="text-[var(--primary)]">Preparation Time</span>
                  </>
                )}
              </h1>
              <p className="type-body-small mt-1 leading-relaxed text-[#64748B]">
                Check API-reported 1st and final reservation chart preparation times and chart preparation stations for your boarding stop.
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
            <TrainChartPreparationTime
              initialTrain={trainNumber || slug}
              initialDate={date}
              basePath="/chart-times"
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

