import { Suspense } from "react";
import type { Metadata } from "next";
import { LiveTrainStatusTool } from "@/components/LiveTrainStatusTool";
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
  const dateSuffix = date ? ` on ${date}` : "";
  const pageUrl = `${siteConfig.url}/live-train-status/${slug}`;

  return {
    title: { absolute: `${trainLabel} Live Train Running Status & Delay Tracker${dateSuffix} | RailAgents` },
    robots: date ? { index: false, follow: true } : { index: true, follow: true },
    description: `Track real-time live running status, current location, delay, platform number, and upcoming station arrival timings for ${trainLabel}${dateSuffix}.`,
    alternates: {
      canonical: pageUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: `${trainLabel} Live Train Running Status | RailAgents`,
      description: `Track live running status, current location, delay and station timings for ${trainLabel}.`,
      images: [siteConfig.socialImage],
    },
    openGraph: {
      title: `${trainLabel} Live Train Running Status | RailAgents`,
      description: `Track live running status, GPS location, delay, and station arrival timings for ${trainLabel}.`,
      url: pageUrl,
      siteName: siteConfig.name,
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: siteConfig.socialImage,
          width: 1200,
          height: 630,
          alt: `${trainLabel} Live Running Status - RailAgents`,
        },
      ],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function LiveTrainSlugPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { date } = await searchParams;
  const { trainNumber } = parseTrainSlug(slug);

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFDF8] py-12 text-center text-slate-500">Loading train status…</div>}>
      <LiveTrainStatusTool initialTrain={trainNumber || slug} initialDate={date} />
    </Suspense>
  );
}

