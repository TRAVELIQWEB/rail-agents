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
  { label: "YouTube", href: siteConfig.social.youtube, icon: FaYoutube },
  { label: "Instagram", href: siteConfig.social.instagram, icon: FaInstagram },
  { label: "Facebook", href: siteConfig.social.facebook, icon: FaFacebookF },
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

interface QueryPageProps {
  mode?: "ask-nihal" | "contact";
}

export function QueryPage({ mode = "ask-nihal" }: QueryPageProps) {
  const isContact = mode === "contact";

  return (
    <div className="flex min-h-screen flex-col bg-[#fffdf9]">
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* =========================================================
            MAIN SECTION: 1180px CONTAINER, 42%/58% GRID, NATURAL HEIGHT
        ========================================================== */}
        <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_#ffecd6_0%,_#fff6eb_40%,_#fffdf9_80%)] pt-6 pb-8 sm:pt-8 sm:pb-10 lg:pt-9 lg:pb-11">
          {/* Ambient Glow */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 top-1/4 h-[420px] w-[420px] rounded-full bg-orange-200/40 blur-3xl"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-20 bottom-10 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl"
          />

          <div className="relative z-10 mx-auto w-full max-w-[1180px] px-4 sm:px-6">
            {/* Desktop Two-Column CSS Grid: 42% left, 58% right, 44px gap, vertically centered */}
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)] lg:items-center lg:gap-11 xl:gap-12">

              {/* ══ LEFT COLUMN (42%): Heading & Information Cards ══ */}
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                {/* Badge: 14px (12-16px) margin below */}
                <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-[#f5d0be] bg-white/90 px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-[#F36B21] shadow-2xs backdrop-blur-sm">
                  <span className="h-2 w-2 rounded-full bg-[#F36B21] animate-pulse" />
                  <span>{isContact ? "CONTACT RAILAGENTS • SUPPORT DESK" : "ASK NIHAL SINGH • RAILWAY GUIDANCE"}</span>
                </div>

                {/* Exact Heading: Navy and Orange, balanced font size & line-height */}
                <h1 className="text-2xl sm:text-3xl lg:text-[1.95rem] font-black leading-[1.22] tracking-tight text-[#0f2747]">
                  {isContact ? (
                    <>
                      Contact RailAgents —{" "}
                      <span className="text-[#F36B21]">Support &amp; Travel Guidance Desk.</span>
                    </>
                  ) : (
                    <>
                      Ask Nihal Singh —{" "}
                      <span className="text-[#F36B21]">Your Railway Question Deserves a Clear Answer.</span>
                    </>
                  )}
                </h1>

                {/* Description: 18px (16-20px) margin above */}
                <p className="mt-4 sm:mt-4.5 text-sm sm:text-[15px] leading-relaxed text-slate-600 max-w-lg">
                  {isContact
                    ? "Have questions about IRCTC agent registration, railway ticketing rules, or general travel guidance? Reach out to our team directly."
                    : "From IRCTC agent registration and railway bookings to bus, air, hotel, and other travel questions, tell us what you need help understanding."}
                </p>

                {/* Three Information Cards: 12px vertical gap, equal heights, full width of column */}
                <div className="mt-5 sm:mt-6 space-y-3 w-full">
                  {features.map(({ icon: Icon, title, subtitle }) => (
                    <div
                      key={title}
                      className="flex min-h-[58px] sm:min-h-[60px] items-center gap-3.5 rounded-2xl border border-orange-100/90 bg-white/85 p-3 sm:px-3.5 sm:py-3 shadow-2xs backdrop-blur-xs transition-transform duration-150 hover:-translate-y-0.5 text-left"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#ffe8d6] to-[#fff3e8] text-[#F36B21] shadow-2xs">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-xs sm:text-sm font-extrabold text-[#0f2747]">
                          {title}
                        </h2>
                        <p className="text-[11px] sm:text-xs text-slate-500 leading-tight">
                          {subtitle}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ══ RIGHT COLUMN (58%): WhatsApp Form Card (100% width of column) ══ */}
              <div className="relative z-20 w-full">
                <QueryForm />
              </div>

            </div>

            {/* ══ BOTTOM INFORMATION STRIP: 28px (24-32px) SPACING ABOVE ══ */}
            <div className="mt-7 sm:mt-8 w-full">
              <div className="flex flex-col gap-4 rounded-2xl border border-[#fee4d0] bg-white/95 p-3.5 sm:px-5 sm:py-3.5 shadow-xs backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3.5 text-left">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#fff3e8] to-[#ffedd5] text-[#F36B21] shadow-2xs">
                    <Lightbulb className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-[#F36B21]">
                      ASK WITH CONFIDENCE
                    </p>
                    <p className="mt-0.5 text-xs text-slate-600 sm:text-[13px] leading-relaxed">
                      Tell us a little about your question. We&apos;ll help you find
                      useful information about travel and railway topics.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-1.5 shrink-0 border-t border-slate-100 pt-3 sm:border-t-0 sm:pt-0">
                  <p className="text-xs font-bold text-[#0f2747]">Follow RailAgents</p>
                  <ul className="social-icon-list">
                    {socialLinks.map(({ label, href, icon: Icon }) => (
                      <li key={label} className="social-icon-item">
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Follow RailAgents on ${label}`}
                          data-social={label.toLowerCase()}
                          className="social-link social-link--light"
                        >
                          <div className="social-filled" />
                          <Icon aria-hidden="true" />
                        </a>
                        <div className="social-tooltip">{label}</div>
                      </li>
                    ))}
                  </ul>
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
