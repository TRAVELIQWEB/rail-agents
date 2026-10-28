import {
  Headphones,
  Lightbulb,
  MessageCircle,
  Zap,
} from "lucide-react";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa6";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { QueryForm } from "@/components/ui/QueryForm";
import { siteConfig } from "@/config/site";

const socialLinks = [
  { label: "YouTube", href: siteConfig.social.youtube, icon: FaYoutube, color: "#FF0000" },
  { label: "Instagram", href: siteConfig.social.instagram, icon: FaInstagram, color: "#E4405F" },
  { label: "Facebook", href: siteConfig.social.facebook, icon: FaFacebookF, color: "#1877F2" },
].filter(({ href }) => href);

const features = [
  {
    icon: MessageCircle,
    title: "Helpful, clear guidance",
    subtitle: "Get simple, clear explanations",
  },
  {
    icon: Headphones,
    title: "A real team, ready to help",
    subtitle: "Help finding useful information",
  },
  {
    icon: Zap,
    title: "Quick response",
    subtitle: "We reply as soon as possible",
  },
];

export function QueryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fffdf9]">
      <Header />
      <main className="flex-1">
        {/* =========================================================
            MAIN CONTACT / ASK NIHAL SECTION (CLEAN 2-COLUMN, NO STRETCH)
        ========================================================== */}
        <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_#ffecd6_0%,_#fff6eb_40%,_#fffdf9_80%)] py-7 sm:py-9 lg:py-11">
          {/* Ambient Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 top-1/3 h-[450px] w-[450px] rounded-full bg-orange-200/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl"
          />

          <div className="site-container relative z-10 max-w-5xl">
            {/* Focused 2-Column Grid Layout (Left Content: 5 cols | Right Form: 7 cols) */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12 lg:gap-8 xl:gap-12">

              {/* ══ LEFT COLUMN: Heading & Features (5 Cols) ══ */}
              <div className="flex flex-col items-center text-center md:pt-1 lg:col-span-5 lg:items-start lg:text-left">
                {/* Top Badge */}
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f5d0be] bg-white/90 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#ea580c] shadow-sm backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-[#f97316]" />
                  ASK NIHAL SINGH • CONTACT
                </div>

                {/* Main Heading */}
                <h1 className="page-hero-title">
                  Your railway question{" "}
                  <span className="block">deserves a clear</span>
                  <span className="hero-accent relative inline-block">
                    answer.
                    {/* Curved Underline */}
                    <svg
                      className="absolute -bottom-2 left-0 h-3 w-full text-[var(--primary)]"
                      viewBox="0 0 200 12"
                      fill="none"
                    >
                      <path
                        d="M 2,8 Q 100,2 198,8"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="page-hero-description mx-auto mt-5 max-w-md lg:mx-0">
                  From IRCTC agent registration and railway bookings to bus, air,
                  hotel, and other travel questions, tell us what you need help understanding.
                </p>

                {/* 3 Feature Rows */}
                <div className="mt-8 space-y-4">
                  {features.map(({ icon: Icon, title, subtitle }) => (
                    <div key={title} className="flex flex-col items-center gap-2 text-center md:flex-row md:justify-center md:gap-3.5 md:text-left lg:justify-start">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#ffe8d6] text-[#ea580c] shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-[#0f2747] sm:text-base">
                          {title}
                        </h3>
                        <p className="text-xs text-slate-500">{subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ══ RIGHT COLUMN: Contact Form Card (7 Cols) ══ */}
              <div className="relative z-20 lg:col-span-7 lg:mt-[42px]">
                <QueryForm />
              </div>

            </div>

            {/* ══ BOTTOM BANNER: ASK WITH CONFIDENCE ══ */}
            <div className="mt-10 sm:mt-12">
              <div className="mx-auto flex flex-col gap-4 rounded-2xl border border-[#fee4d0] bg-white/95 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div className="flex flex-col items-center gap-3.5 text-center sm:flex-row sm:text-left">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#fff3e8] text-[#f97316]">
                    <Lightbulb className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#ea580c]">
                      ASK WITH CONFIDENCE
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
                      Tell us a little about your question. We&apos;ll help you find
                      useful information about travel and railway topics.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2 sm:items-end">
                  <p className="text-xs font-bold text-[#0f2747]">Follow RailAgents</p>
                  <div className="flex items-center gap-2">
                    {socialLinks.map(({ label, href, icon: Icon, color }) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Follow RailAgents on ${label}`}
                        title={label}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-orange-100 bg-[#fffaf5] transition-all hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                      >
                        <Icon aria-hidden="true" className="h-4 w-4" style={{ color }} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
