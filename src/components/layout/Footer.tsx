import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/Logo";
import { InternalLink } from "@/components/ui/InternalLink";

const quickLinks = [
  { label: "Live Train Status", href: "/live-train-status" },
  { label: "PNR Status Check", href: "/pnr-status" },
  { label: "Train Fare Calculator", href: "/train-ticket-agent-fare-calculator" },
  { label: "Ticket Date Calculator", href: "/ticket-date-calculator" },
  { label: "Chart Preparation Time", href: "/train-chart-preparation-time" },
  { label: "Refund Calculator", href: "/irctc-cancellation-refund-calculator" },
  { label: "All Railway Tools", href: "/tools" },
];

const supportLinks = [
  { label: "Railway Agent Guides", href: "/guides" },
  { label: "IRCTC Agent Registration", href: "/irctc-agent-registration" },
  { label: "IRCTC PSP Directory", href: "/irctc-principal-service-providers-updated-29-03-2025" },
  { label: "Rules & Regulations", href: "/irctc-agent-rules-regulations" },
  { label: "Ask Nihal Singh", href: "/ask-nihal" },
  { label: "Blog & Railway Insights", href: "/blog" },
  { label: "Terms & Conditions", href: "/terms" },
];

const socialLinks = [
  { label: "YouTube", href: siteConfig.social.youtube, icon: FaYoutube, color: "#FF0000" },
  { label: "Facebook", href: siteConfig.social.facebook, icon: FaFacebookF, color: "#1877F2" },
  { label: "Instagram", href: siteConfig.social.instagram, icon: FaInstagram, color: "#E4405F" },
  { label: "X", href: siteConfig.social.twitter, icon: FaXTwitter, color: "#FFFFFF" },
  { label: "LinkedIn", href: siteConfig.social.linkedin, icon: FaLinkedinIn, color: "#0A66C2" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-5 bg-[linear-gradient(135deg,#153350_0%,#102b4e_45%,#0c2038_100%)] text-white">
      <div className="site-container py-8 sm:py-10">
        <div className="grid grid-cols-1 items-start gap-x-8 gap-y-8 min-[380px]:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-x-10 xl:gap-x-12">
          <div className="flex min-w-0 flex-col items-start text-left min-[380px]:col-span-2 lg:col-span-1">
            <div className="flex min-h-11 items-center">
            <Logo variant="light" />
            </div>
            <p className="mt-3 max-w-[300px] text-sm leading-6 text-white/75">
              Clear railway agent information, practical guides, and help with
              travel-related questions.
            </p>
            <div className="mt-4">
            <ul className="social-icon-list justify-start">
              {socialLinks.map(({ label, href, icon: Icon }) =>
                href ? (
                  <li key={label} className="social-icon-item">
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      data-social={label.toLowerCase()}
                      className="social-link"
                    >
                      <div className="social-filled" />
                      <Icon aria-hidden="true" />
                    </a>
                    <div className="social-tooltip">{label}</div>
                  </li>
                ) : null,
              )}
            </ul>
            </div>
          </div>

          <FooterLinkColumn title="Railway Tools" items={quickLinks} />
          <FooterLinkColumn title="Guidance & Support" items={supportLinks} />

          <div className="min-w-0 text-left min-[380px]:col-span-2 lg:col-span-1">
            <h2 className="flex min-h-11 items-center text-sm font-extrabold text-white">Stay Updated</h2>
            <p className="mt-3 max-w-[280px] text-sm leading-6 text-white/75">
              Follow us for the latest railway agent guides and updates.
            </p>
            {siteConfig.social.youtube ? (
              <a
                href={siteConfig.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-[var(--primary)] px-3.5 py-2.5 text-sm font-[600] text-white transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                Subscribe on YouTube
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start gap-2 border-t border-white/15 pt-5 text-left text-xs leading-6 text-white/65 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <p>&copy; {currentYear} RailAgents. All rights reserved.</p>
          <p className="lg:text-right">
            Designed and developed by{" "}
            <a
              href="https://coderlala.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              CoderLala Technologies Pvt. Ltd.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinkColumn({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="min-w-0 text-left">
      <h2 className="flex min-h-11 items-center text-sm font-extrabold text-white">{title}</h2>
      <ul className="mt-3 flex flex-col items-start gap-2 text-sm leading-6 text-white/75">
        {[...items].sort((a, b) => a.label.length - b.label.length).map(({ label, href }) => (
          <li key={href}>
            <InternalLink
              href={href}
              prefetch={false}
              className="inline-block break-words transition-colors hover:text-[var(--primary-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              {label}
            </InternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
