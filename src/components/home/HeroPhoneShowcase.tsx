import Link from "next/link";
import {
  Train,
  Ticket,
  Clock,
  Calendar,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

export function HeroPhoneShowcase() {
  return (
    <div
      aria-label="Illustrative 3D preview of RailAgents utilities"
      className="relative flex justify-center lg:col-span-5 lg:justify-center xl:justify-center lg:-translate-x-4 xl:-translate-x-8 lg:-translate-y-4 xl:-translate-y-6 min-w-0 max-w-full select-none"
    >
      {/* Outer showcase container matching exact reference scale */}
      <div className="relative w-full max-w-[340px] xs:max-w-[380px] sm:max-w-[440px] lg:max-w-[480px] xl:max-w-[500px] py-4 sm:py-8 lg:py-6">
        
        {/* Soft Ambient Radial Glow Behind Device */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[380px] w-[380px] sm:h-[460px] sm:w-[460px] rounded-full bg-gradient-to-tr from-[#F36B21]/25 via-[#FFA057]/30 to-white/70 blur-3xl -z-10"
        />

        {/* 3D Perspective Stage */}
        <div className="relative [perspective:1400px]">

          {/* Decorative Warm Sunlight Radiant Ticks at Top-Left of Phone */}
          <div aria-hidden="true" className="pointer-events-none absolute -top-3 sm:-top-5 left-8 sm:left-14 z-20 flex gap-1.5 items-end">
            <span className="h-4 sm:h-5 w-1 sm:w-1.5 rounded-full bg-[#F36B21] -rotate-45 shadow-[0_0_8px_rgba(243,107,33,0.6)]" />
            <span className="h-5 sm:h-6 w-1 sm:w-1.5 rounded-full bg-[#F36B21] -rotate-12 mb-1 shadow-[0_0_8px_rgba(243,107,33,0.6)]" />
            <span className="h-3.5 sm:h-4 w-1 sm:w-1.5 rounded-full bg-[#F36B21] rotate-25 shadow-[0_0_8px_rgba(243,107,33,0.6)]" />
          </div>



          {/* 
            SLIM & TALL 3D SMARTPHONE (Exact Reference Match)
            - Proportions: Tall 9:19.5 smartphone silhouette
            - Chassis: Clean pure-white front face with subtle orange perimeter line
            - 3D Extrusion: Layered bottom & right 3D edge simulating physical phone depth
            - Angle: rotateY(-14deg) rotateX(10deg) rotateZ(-2deg)
          */}
          <div
            className="relative z-10 mx-auto w-[250px] xs:w-[270px] sm:w-[295px] lg:w-[315px] rounded-[44px] sm:rounded-[48px] bg-white p-2.5 sm:p-3 border-[2.5px] border-[#F36B21] shadow-[12px_20px_0px_rgba(243,107,33,0.25),18px_28px_50px_rgba(20,43,69,0.22),0_4px_16px_rgba(243,107,33,0.2)] [transform:rotateY(-14deg)_rotateX(10deg)_rotateZ(-2deg)] motion-safe:transition-transform motion-safe:duration-300 hover:[transform:rotateY(-8deg)_rotateX(5deg)_rotateZ(-1deg)] motion-reduce:transform-none"
          >
            {/* Phone Screen Interior: Soft off-white canvas with generous vertical flow */}
            <div className="rounded-[36px] sm:rounded-[40px] bg-[#F8FAFC] p-3 sm:p-3.5 pt-2 pb-4 shadow-inner">
              
              {/* Phone Speaker Slit & Front Camera Punch */}
              <div className="mx-auto mb-3 flex h-3 w-14 items-center justify-center rounded-full bg-[#EAECF0]/80">
                <div className="h-1 w-1 rounded-full bg-[#94A3B8]" />
              </div>

              {/* In-App Header: RailAgents Brand */}
              <div className="mb-3.5 flex items-center justify-center gap-1.5 text-center">
                <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-lg bg-[#F36B21] text-white shadow-2xs">
                  <Train className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="type-body-small  font-black tracking-tight text-[#142B45]">
                  Rail<span className="text-[#F36B21]">Agents</span>
                </span>
              </div>

              {/* In-App Interactive Tool List (4 Pill-Rounded Soft-Shadow Cards matching Reference) */}
              <div className="space-y-2.5">
                {/* 1. Live Train Status */}
                <Link
                  href="/live-train-status"
                  prefetch={false}
                  className="group flex items-center gap-2.5 rounded-2xl bg-white p-2.5 sm:p-3 shadow-[0_3px_12px_rgba(20,43,69,0.06)] transition-all hover:shadow-[0_6px_20px_rgba(243,107,33,0.14)] hover:-translate-y-0.5"
                >
                  <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EB] text-[#F36B21]">
                    <Train className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="type-body-small  font-extrabold text-[#142B45] leading-tight group-hover:text-[#F36B21] transition-colors">
                      Live Train Status
                    </p>
                    <p className="type-body-small  text-[#64748B] leading-tight truncate mt-0.5">
                      Real-time train running status
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8] group-hover:text-[#F36B21] group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* 2. PNR Status */}
                <Link
                  href="/pnr-status"
                  prefetch={false}
                  className="group flex items-center gap-2.5 rounded-2xl bg-white p-2.5 sm:p-3 shadow-[0_3px_12px_rgba(20,43,69,0.06)] transition-all hover:shadow-[0_6px_20px_rgba(243,107,33,0.14)] hover:-translate-y-0.5"
                >
                  <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EB] text-[#F36B21]">
                    <Ticket className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="type-body-small  font-extrabold text-[#142B45] leading-tight group-hover:text-[#F36B21] transition-colors">
                      PNR Status
                    </p>
                    <p className="type-body-small  text-[#64748B] leading-tight truncate mt-0.5">
                      Check your ticket details
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8] group-hover:text-[#F36B21] group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* 3. Chart Timing */}
                <Link
                  href="/chart-times"
                  prefetch={false}
                  className="group flex items-center gap-2.5 rounded-2xl bg-white p-2.5 sm:p-3 shadow-[0_3px_12px_rgba(20,43,69,0.06)] transition-all hover:shadow-[0_6px_20px_rgba(243,107,33,0.14)] hover:-translate-y-0.5"
                >
                  <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EB] text-[#F36B21]">
                    <Clock className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="type-body-small  font-extrabold text-[#142B45] leading-tight group-hover:text-[#F36B21] transition-colors">
                      Chart Timing
                    </p>
                    <p className="type-body-small  text-[#64748B] leading-tight truncate mt-0.5">
                      First &amp; final chart preparation time
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8] group-hover:text-[#F36B21] group-hover:translate-x-0.5 transition-transform" />
                </Link>

                {/* 4. Ticket Date Calculator */}
                <Link
                  href="/ticket-date-calculator"
                  prefetch={false}
                  className="group flex items-center gap-2.5 rounded-2xl bg-white p-2.5 sm:p-3 shadow-[0_3px_12px_rgba(20,43,69,0.06)] transition-all hover:shadow-[0_6px_20px_rgba(243,107,33,0.14)] hover:-translate-y-0.5"
                >
                  <span className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-[#FFF3EB] text-[#F36B21]">
                    <Calendar className="h-4.5 w-4.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="type-body-small  font-extrabold text-[#142B45] leading-tight group-hover:text-[#F36B21] transition-colors">
                      Ticket Date Calculator
                    </p>
                    <p className="type-body-small  text-[#64748B] leading-tight truncate mt-0.5">
                      Find valid IRCTC booking dates
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-[#94A3B8] group-hover:text-[#F36B21] group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

            </div>
          </div>

          {/* 
            FLOATING CARD 1: Left PNR Status (Confirmed)
            - Pill-rounded corners
            - Deep 3D drop shadow
            - Tilted slightly on the 3D plane
            - Overlaps only outer rim, never covering card text
          */}
          <Link
            href="/pnr-status"
            prefetch={false}
            className="absolute -left-3 sm:-left-12 lg:-left-16 top-24 sm:top-28 z-30 w-[130px] sm:w-[155px] lg:w-[165px] rounded-[22px] bg-white p-3 sm:p-3.5 shadow-[0_20px_45px_-8px_rgba(20,43,69,0.22),0_8px_16px_rgba(20,43,69,0.08)] border border-white/90 text-left [transform:rotateY(-10deg)_rotateX(6deg)_translateZ(20px)] motion-safe:transition-transform motion-safe:duration-300 hover:scale-105 motion-reduce:transform-none cursor-pointer"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Ticket className="h-4 w-4 text-[#F36B21]" aria-hidden="true" />
              <span className="type-caption  font-black text-[#142B45]">PNR Status</span>
            </div>
            
            <div className="type-caption mt-2.5 inline-flex items-center gap-1 rounded-full bg-[#E8F8F0] px-2.5 py-1 font-extrabold text-[#16A36A]">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Confirmed</span>
            </div>

            {/* Skeleton passenger preview bars */}
            <div className="mt-2.5 space-y-1.5">
              <div className="h-1.5 sm:h-2 w-20 sm:w-24 rounded-full bg-[#E2E8F0]" />
              <div className="h-1.5 sm:h-2 w-12 sm:w-16 rounded-full bg-[#F1F5F9]" />
            </div>
          </Link>

          {/* 
            FLOATING CARD 2: Top Right Live Train (Running On Time)
            - Floats high at upper right
            - Soft 3D elevation
            - Vertical train route timeline
          */}
          <Link
            href="/live-train-status"
            prefetch={false}
            className="absolute -right-3 sm:-right-10 lg:-right-14 top-1 sm:top-2 z-30 w-[140px] sm:w-[170px] lg:w-[185px] rounded-[22px] bg-white p-3 sm:p-3.5 shadow-[0_20px_45px_-8px_rgba(20,43,69,0.22),0_8px_16px_rgba(20,43,69,0.08)] border border-white/90 text-left [transform:rotateY(-8deg)_rotateX(6deg)_translateZ(30px)] motion-safe:transition-transform motion-safe:duration-300 hover:scale-105 motion-reduce:transform-none cursor-pointer"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Train className="h-4 w-4 text-[#F36B21]" aria-hidden="true" />
              <span className="type-caption  font-black text-[#142B45]">Live Train</span>
            </div>

            <div className="type-caption mt-2 inline-flex items-center gap-1 rounded-full bg-[#E8F8F0] px-2.5 py-1 font-extrabold text-[#16A36A]">
              <span className="h-2 w-2 rounded-full bg-[#16A36A] animate-pulse" />
              <span>Running On Time</span>
            </div>

            {/* Route Timeline Graphic */}
            <div className="mt-2.5 flex items-center gap-2.5">
              <div className="flex flex-col items-center">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-[#16A36A] bg-[#16A36A]" />
                <span className="h-4 w-0.5 bg-[#16A36A]/50" />
                <span className="h-2.5 w-2.5 rounded-full border-2 border-[#16A36A] bg-white" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="h-1.5 sm:h-2 w-16 sm:w-22 rounded-full bg-[#E2E8F0]" />
                <div className="h-1.5 sm:h-2 w-10 sm:w-14 rounded-full bg-[#F1F5F9]" />
              </div>
            </div>
          </Link>

          {/* 
            FLOATING CARD 3: Bottom Right Chart Timing
            - Floats low at bottom right
            - Generous vertical gap from top card
            - Clean 2-row timings
          */}
          <Link
            href="/chart-times"
            prefetch={false}
            className="absolute -right-3 sm:-right-10 lg:-right-14 bottom-3 sm:bottom-4 z-30 w-[150px] sm:w-[185px] lg:w-[200px] rounded-[22px] bg-white p-3 sm:p-3.5 shadow-[0_20px_45px_-8px_rgba(20,43,69,0.22),0_8px_16px_rgba(20,43,69,0.08)] border border-white/90 text-left [transform:rotateY(-8deg)_rotateX(6deg)_translateZ(25px)] motion-safe:transition-transform motion-safe:duration-300 hover:scale-105 motion-reduce:transform-none cursor-pointer"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
              <Clock className="h-4 w-4 text-[#F36B21]" aria-hidden="true" />
              <span className="type-caption  font-black text-[#142B45]">Chart Timing</span>
            </div>

            <div className="space-y-2 border-t border-[#F1F5F9] pt-2">
              <div className="flex items-center justify-between">
                <span className="type-caption flex items-center gap-1.5 text-[#64748B] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F36B21]" />
                  First Chart
                </span>
                <span className="type-caption  font-black text-[#142B45]">09:58 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="type-caption flex items-center gap-1.5 text-[#64748B] font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#F36B21]" />
                  Final Chart
                </span>
                <span className="type-caption  font-black text-[#142B45]">07:45 PM</span>
              </div>
            </div>
          </Link>



        </div>
      </div>
    </div>
  );
}
