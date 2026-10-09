import Image from "next/image";
import { ArrowRight, Play, Heart, MessageCircle, Share2, Bookmark, ThumbsUp } from "lucide-react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa6";
import { siteConfig } from "@/config/site";

export function SocialCards() {
  return (
    <div className="w-full">
      {/* =========================
          SECTION HEADER
      ========================== */}
      <div className="text-center mb-6 sm:mb-8">
        {/* Top Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#ffd5c2] bg-[#fff3ec] px-4 py-1.5 text-xs font-bold text-[#f97316] shadow-sm mb-3">
          <span className="text-sm">👥</span> Stay Connected
        </div>

        {/* Heading */}
        <h2 className="text-2xl sm:text-4xl lg:text-[2.6rem] font-extrabold text-[var(--navy)] tracking-tight">
          Follow Us for{" "}
          <span className="relative inline-block text-[var(--primary)]">
            Daily Updates
            {/* Top right spark accents */}
            <svg
              className="absolute -top-3 -right-6 w-6 h-6 text-[#f97316]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 2v4M18.36 5.64l-2.83 2.83M22 12h-4" />
            </svg>
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed px-4">
          Get the latest railway updates, helpful tips, video guides and community support across all our social media channels.
        </p>

        {/* Bottom Orange Bar Indicator */}
        <div className="mx-auto mt-4 h-1 w-14 rounded-full bg-[var(--primary)]" />
      </div>

      {/* =========================
          3 SOCIAL CARDS GRID
      ========================== */}
      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:gap-8 2xl:grid-cols-3">
        
        {/* CARD 1: YOUTUBE */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[#fecaca] bg-gradient-to-br from-white via-[#fff8f8] to-[#fff0f0] p-6 sm:p-7 shadow-[0_10px_30px_rgba(239,68,68,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(239,68,68,0.12)]">
          {/* Background Glow */}
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-red-200/40 blur-2xl transition-opacity group-hover:opacity-80" />

          {/* Top Bar: 3D App Icon + Category Badge */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* 3D Icon Box */}
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff4d4d] via-[#ff0000] to-[#cc0000] text-white shadow-[0_8px_20px_rgba(255,0,0,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)]">
              {/* Spark accents on top */}
              <div className="absolute -top-2 -right-1 text-red-500 text-xs font-bold leading-none select-none">✨</div>
              <FaYoutube className="h-6 w-6" />
            </div>

            {/* Category Tag */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#fecaca] bg-[#fff0f0] px-3 py-1 text-xs font-bold text-[#e11d48]">
              <span>🎥</span> Video Guides
            </div>
          </div>

          {/* Card Body & Graphics Container */}
          <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Left Content */}
            <div className="sm:col-span-7 flex flex-col items-start">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--navy)]">
                Watch on <span className="text-[#ff0000]">YouTube</span>
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Step-by-step railway guides and travel business tips in easy video tutorials.
              </p>

              {/* Action Button */}
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Subscribe on YouTube"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff5500] to-[#f97316] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_6px_20px_rgba(249,115,22,0.3)] transition-all duration-200 hover:scale-105 hover:shadow-[0_8px_25px_rgba(249,115,22,0.4)]"
              >
                Subscribe <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Right Graphic: Hand-drawn annotation + Tilted Frame */}
            <div className="sm:col-span-5 relative flex flex-col items-center sm:items-end justify-center mt-4 sm:mt-0">
              {/* Annotation Label + Curved Arrow */}
              <div className="absolute -top-7 right-2 z-20 flex flex-col items-center select-none pointer-events-none">
                <span className="text-[11px] font-black text-[#e11d48] tracking-tight -rotate-3 whitespace-nowrap drop-shadow-sm">
                  New Videos Every Week
                </span>
                <svg className="w-8 h-6 text-[#e11d48] -mt-0.5 transform rotate-12" viewBox="0 0 40 30" fill="none">
                  <path d="M 5,2 Q 25,2 32,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M 24,16 L 32,20 L 32,12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>

              {/* Tilted Phone / Mock Card */}
              <div className="relative w-32 sm:w-36 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)] rotate-6 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
                {/* Media frame */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-900">
                  <Image
                    src="/images/nihal-singh-cutout.png"
                    alt="Nihal Singh YouTube Preview"
                    fill
                    className="object-cover object-top"
                  />
                  {/* Play Button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-md">
                      <Play className="h-4 w-4 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Skeleton bottom lines */}
                <div className="mt-2 space-y-1 px-0.5">
                  <div className="h-1.5 w-3/4 rounded-full bg-slate-200" />
                  <div className="h-1.5 w-1/2 rounded-full bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: INSTAGRAM */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[#f5d0fe] bg-gradient-to-br from-white via-[#fdf4ff] to-[#fae8ff] p-6 sm:p-7 shadow-[0_10px_30px_rgba(217,70,239,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(217,70,239,0.12)]">
          {/* Background Glow */}
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-fuchsia-200/40 blur-2xl transition-opacity group-hover:opacity-80" />

          {/* Top Bar: 3D App Icon + Category Badge */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* 3D Icon Box */}
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-[0_8px_20px_rgba(238,42,123,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)]">
              {/* Spark accents on top */}
              <div className="absolute -top-2 -right-1 text-pink-500 text-xs font-bold leading-none select-none">✨</div>
              <FaInstagram className="h-6 w-6" />
            </div>

            {/* Category Tag */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f5d0fe] bg-[#fae8ff] px-3 py-1 text-xs font-bold text-[#c026d3]">
              <span>🖼️</span> Daily Updates
            </div>
          </div>

          {/* Card Body & Graphics Container */}
          <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Left Content */}
            <div className="sm:col-span-7 flex flex-col items-start">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--navy)]">
                Follow on <span className="bg-gradient-to-r from-[#e1306c] to-[#c13584] bg-clip-text text-transparent">Instagram</span>
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Quick tips, updates, reels and useful booking information.
              </p>

              {/* Action Button */}
              <a
                href={siteConfig.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow on Instagram"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff5500] to-[#f97316] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_6px_20px_rgba(249,115,22,0.3)] transition-all duration-200 hover:scale-105 hover:shadow-[0_8px_25px_rgba(249,115,22,0.4)]"
              >
                Follow <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Right Graphic: Hand-drawn annotation + Tilted Frame */}
            <div className="sm:col-span-5 relative flex flex-col items-center sm:items-end justify-center mt-4 sm:mt-0">
              {/* Annotation Label + Curved Arrow */}
              <div className="absolute -top-7 right-2 z-20 flex flex-col items-center select-none pointer-events-none">
                <span className="text-[11px] font-black text-[#c026d3] tracking-tight -rotate-3 whitespace-nowrap drop-shadow-sm">
                  Tips, Reels & Updates
                </span>
                <svg className="w-8 h-6 text-[#c026d3] -mt-0.5 transform rotate-12" viewBox="0 0 40 30" fill="none">
                  <path d="M 5,2 Q 25,2 32,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M 24,16 L 32,20 L 32,12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>

              {/* Tilted Instagram Mock Card */}
              <div className="relative w-32 sm:w-36 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)] rotate-6 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
                {/* Header */}
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                  <div className="h-4 w-4 rounded-full bg-gradient-to-tr from-[#f9ce34] to-[#ee2a7b] flex items-center justify-center text-[8px] text-white font-bold">R</div>
                  <div className="h-1.5 w-12 rounded-full bg-slate-200" />
                </div>

                {/* Media frame */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-amber-50 mt-1.5">
                  <Image
                    src="/images/nihal-singh-cutout.png"
                    alt="Nihal Singh Instagram Post"
                    fill
                    className="object-cover object-top"
                  />
                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow">
                      <Play className="h-3.5 w-3.5 fill-slate-800 ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Instagram Icons bar */}
                <div className="mt-1.5 flex items-center justify-between text-slate-400 px-0.5">
                  <div className="flex items-center gap-1.5">
                    <Heart className="h-3 w-3 fill-pink-500 text-pink-500" />
                    <MessageCircle className="h-3 w-3" />
                    <Share2 className="h-3 w-3" />
                  </div>
                  <Bookmark className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: FACEBOOK */}
        <div className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-[#bae6fd] bg-gradient-to-br from-white via-[#f0f9ff] to-[#e0f2fe] p-6 sm:p-7 shadow-[0_10px_30px_rgba(2,132,199,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(2,132,199,0.12)]">
          {/* Background Glow */}
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-sky-200/40 blur-2xl transition-opacity group-hover:opacity-80" />

          {/* Top Bar: 3D App Icon + Category Badge */}
          <div className="relative z-10 flex items-center justify-between gap-3">
            {/* 3D Icon Box */}
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-[#3b82f6] via-[#1d4ed8] to-[#1e40af] text-white shadow-[0_8px_20px_rgba(29,78,216,0.35),inset_0_2px_4px_rgba(255,255,255,0.4)]">
              {/* Spark accents on top */}
              <div className="absolute -top-2 -right-1 text-blue-500 text-xs font-bold leading-none select-none">✨</div>
              <FaFacebookF className="h-6 w-6" />
            </div>

            {/* Category Tag */}
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#bae6fd] bg-[#e0f2fe] px-3 py-1 text-xs font-bold text-[#0284c7]">
              <span>👥</span> Community
            </div>
          </div>

          {/* Card Body & Graphics Container */}
          <div className="relative z-10 mt-6 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Left Content */}
            <div className="sm:col-span-7 flex flex-col items-start">
              <h3 className="text-xl sm:text-2xl font-extrabold text-[var(--navy)]">
                Join on <span className="text-[#1877f2]">Facebook</span>
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Stay updated with posts, guides and community discussions.
              </p>

              {/* Action Button */}
              <a
                href={siteConfig.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Join on Facebook"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#ff5500] to-[#f97316] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-[0_6px_20px_rgba(249,115,22,0.3)] transition-all duration-200 hover:scale-105 hover:shadow-[0_8px_25px_rgba(249,115,22,0.4)]"
              >
                Follow <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            {/* Right Graphic: Hand-drawn annotation + Tilted Frame */}
            <div className="sm:col-span-5 relative flex flex-col items-center sm:items-end justify-center mt-4 sm:mt-0">
              {/* Annotation Label + Curved Arrow */}
              <div className="absolute -top-7 right-2 z-20 flex flex-col items-center select-none pointer-events-none">
                <span className="text-[11px] font-black text-[#0284c7] tracking-tight -rotate-3 whitespace-nowrap drop-shadow-sm">
                  Be Part of Our Community
                </span>
                <svg className="w-8 h-6 text-[#0284c7] -mt-0.5 transform rotate-12" viewBox="0 0 40 30" fill="none">
                  <path d="M 5,2 Q 25,2 32,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  <path d="M 24,16 L 32,20 L 32,12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>

              {/* Tilted Facebook Mock Card */}
              <div className="relative w-32 sm:w-36 rounded-2xl border border-slate-200/80 bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.12)] rotate-6 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105">
                {/* Header */}
                <div className="flex items-center gap-1.5 pb-1.5 border-b border-slate-100">
                  <div className="h-4 w-4 rounded-full bg-[#1877f2] flex items-center justify-center text-[8px] text-white font-bold">f</div>
                  <div className="h-1.5 w-14 rounded-full bg-slate-200" />
                </div>

                {/* Media frame */}
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-sky-50 mt-1.5">
                  <Image
                    src="/images/nihal-singh-cutout.png"
                    alt="Nihal Singh Facebook Community"
                    fill
                    className="object-cover object-top"
                  />
                  {/* Thumbs up overlay badge */}
                  <div className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#1877f2] text-white shadow">
                    <ThumbsUp className="h-3 w-3 fill-white" />
                  </div>
                </div>

                {/* Skeleton bottom bar */}
                <div className="mt-2 space-y-1 px-0.5">
                  <div className="h-1.5 w-full rounded-full bg-slate-200" />
                  <div className="h-1.5 w-2/3 rounded-full bg-slate-100" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
