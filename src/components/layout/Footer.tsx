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
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Fare Calculator", href: "/train-ticket-agent-fare-calculator" },
  { label: "Blog", href: "/blog" },
  { label: "Guides", href: "/guides" },
  { label: "Contact Us", href: "/contact" },
];

const supportLinks = [
  { label: "IRCTC Agent Information", href: "/irctc-agent-registration" },
  { label: "Agent Rules & Regulations", href: "/irctc-agent-rules-regulations" },
  { label: "Fare Calculator", href: "/train-ticket-agent-fare-calculator" },
  { label: "Blog Articles", href: "/blog" },
  { label: "Railway Guides", href: "/guides" },
  { label: "Ask Nihal Singh", href: "/ask-nihal" },
  { label: "Contact & Support", href: "/contact" },
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
    <footer className="mt-5 bg-[var(--navy)] text-white">
      <div className="site-container py-6 sm:py-8 wide:py-10">
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.8fr_1.1fr_1.2fr] lg:gap-9 wide:gap-14">
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <Logo variant="light" />
            <p className="mx-auto mt-3 max-w-[300px] text-sm leading-[1.6] text-white/75 md:mx-0 wide:max-w-[380px] wide:text-base">
              Clear railway agent information, practical guides, and help with
              travel-related questions.
            </p>
            <ul className="social-icon-list mt-4 justify-center md:justify-start">
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

          <FooterLinkColumn title="Quick Links" items={quickLinks} />
          <FooterLinkColumn title="Support" items={supportLinks} />

          <div className="text-center md:text-left">
            <h2 className="text-base font-[800] text-white">Stay Updated</h2>
            <p className="mt-2 text-sm leading-[1.55] text-white/75">
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

        <div className="mt-6 flex flex-col items-center gap-2 border-t border-white/15 pt-4 text-center text-[0.8125rem] text-white/65 sm:flex-row sm:justify-between sm:text-left">
          <p>&copy; {currentYear} RailAgents. All rights reserved.</p>
          <p>
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
    <div className="text-center md:text-left">
      <h2 className="text-base font-[800] text-white">{title}</h2>
      <ul className="mt-2.5 flex flex-col items-center space-y-2 text-sm text-white/75 md:items-start">
        {items.map(({ label, href }) => (
          <li key={href}>
            <InternalLink
              href={href}
              prefetch={false}
              className="transition-colors hover:text-[var(--primary-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              {label}
            </InternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
}
