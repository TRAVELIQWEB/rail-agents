import type { Metadata } from "next";
import { Suspense } from "react";
import { LiveTrainStatusTool } from "@/components/LiveTrainStatusTool";

export const metadata: Metadata = {
  title: "Live Train Status | RailAgents",
  description: "Check provider-reported live running status, train location, and station timings for an Indian train.",
  alternates: { canonical: "/live-train-status" },
};

export default function LiveTrainStatusPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC]" aria-label="Loading live train status tool" />}>
      <LiveTrainStatusTool />
    </Suspense>
  );
}
