"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Compass, RotateCcw } from "lucide-react";
import { ParticleText } from "@/components/ui/ParticleText";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global root error boundary triggered:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="m-0 p-0 antialiased font-sans">
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#fffdfa] via-[#fff9f2] to-[#fff4e8] px-4 py-16 text-center sm:px-6">
          {/* Subtle background ambient circles */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-orange-200/40 blur-3xl"
          />

          <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
            {/* Interactive Particle Error Canvas */}
            <div className="w-full h-44 sm:h-56 md:h-64 flex items-center justify-center relative cursor-grab active:cursor-grabbing">
              <ParticleText
                text="404"
                particleSize={3}
                density={3.5}
                color="#0f2747"
                highlightColor="#f97316"
                highlightMode="motion"
                shape="circle"
                intro="gather"
                scatter={220}
                gatherDuration={1500}
                clickBurst={true}
                burstStrength={1.2}
                pointerRepel={45}
                repelRadius={140}
                fontSize="clamp(6rem, 18vw, 12rem)"
                fontWeight={900}
                glow={true}
                className="w-full h-full"
              />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/80 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-[#9a3412] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#f97316] animate-pulse" />
              <span>Page Not Found · Lost in Transit</span>
            </div>

            {/* Heading */}
            <h1 className="mt-4 text-2xl font-black tracking-tight text-[#0f2747] sm:text-4xl md:text-5xl">
              Looks Like You Took an Unscheduled Stop
            </h1>

            {/* Description */}
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 sm:text-base leading-relaxed">
              The rail line or page you are trying to visit doesn&apos;t exist, was renamed, or has departed to another platform.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#f97316] px-6 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5 hover:bg-[#ea580c] cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                <span>Try Again</span>
              </button>

              <Link
                href="/"
                prefetch={false}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-6 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-white hover:border-slate-300 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Safety (Home)</span>
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

