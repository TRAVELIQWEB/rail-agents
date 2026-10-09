import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GuidesDirectory } from "@/components/guides/GuidesDirectory";

export const metadata: Metadata = {
  title: "Railway Agent Guides",
  description:
    "Practical step-by-step guides for railway agents, bookings, registration, refunds and common issues.",
};

export default function GuidesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff9f5]">
      <Header />
      <main className="relative flex-1 overflow-hidden bg-[#fff9f5] py-10 sm:py-14 lg:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-orange-100/50 blur-[90px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-orange-200/30 blur-[100px]"
      />
      <div className="site-container relative">
        <div className="mb-7 max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f5dfcf] bg-white/70 px-3.5 py-2 text-xs font-[800] uppercase tracking-[0.12em] text-[#e96713] shadow-sm backdrop-blur-md">
            <BookOpen aria-hidden="true" className="h-4 w-4" />
            RailAgents Knowledge Center
          </div>
          <h1 className="text-[clamp(2rem,6vw,3.25rem)] font-[850] leading-[1.1] tracking-[-0.045em] text-[var(--navy)]">
            Railway Agent Guides
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Practical step-by-step guides for railway agents, bookings,
            registration, refunds and common issues.
          </p>
        </div>
        <GuidesDirectory />
        <p className="mt-8 max-w-3xl text-xs leading-5 text-slate-500">
          Railway and provider requirements may change. Verify current rules,
          charges, and eligibility with the relevant official or authorized
          source before acting.
        </p>
      </div>
      </main>
      <Footer />
    </div>
  );
}
