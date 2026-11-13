"use client";

import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
} from "react-icons/fa6";
import { useSocialLinks } from "@/components/SocialLinksProvider";
import { railTools } from "@/config/tools";
import { Logo } from "@/components/layout/Logo";
import { InternalLink } from "@/components/ui/InternalLink";

const quickLinks = [
  { label: "All Railway Tools", href: "/tools" },
  ...railTools.map((tool) => ({ label: tool.shortTitle, href: tool.href })),
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

export function Footer() {
  const social = useSocialLinks();
  const socialLinks = [
    { label: "YouTube", href: social.youtube, icon: FaYoutube, color: "#FF0000" },
    { label: "Facebook", href: social.facebook, icon: FaFacebookF, color: "#1877F2" },
    { label: "Instagram", href: social.instagram, icon: FaInstagram, color: "#E4405F" },
  ];
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-5 bg-[linear-gradient(135deg,#153350_0%,#102b4e_45%,#0c2038_100%)] text-white">
      <div className="site-container py-8 sm:py-10">
        <div className="grid grid-cols-1 items-start gap-x-8 gap-y-8 min-[380px]:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-x-10 xl:gap-x-12">
          <div className="flex min-w-0 flex-col items-start text-left min-[380px]:col-span-2 lg:col-span-1">
            <div className="flex min-h-11 items-center">
            <Logo variant="light" />
            </div>
            <p className="type-body-small mt-3 max-w-[300px] leading-6 text-white/75">
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
            <h2 className="type-footer-heading flex min-h-11 items-center text-white">Stay Updated</h2>
            <p className="type-body-small mt-3 max-w-[280px] leading-6 text-white/75">
              Follow us for the latest railway agent guides and updates.
            </p>
            {social.youtube ? (
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="type-button mt-3 inline-flex min-h-11 items-center rounded-lg bg-[var(--primary)] px-3.5 py-2.5 font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                Subscribe on YouTube
              </a>
            ) : null}
          </div>
        </div>

        <div className="type-caption mt-8 flex flex-col items-start gap-2 border-t border-white/15 pt-5 text-left leading-6 text-white/65 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
          <p className="type-caption">&copy; {currentYear} RailAgents. All rights reserved.</p>
          <p className="type-caption lg:text-right">
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
      <h2 className="type-footer-heading flex min-h-11 items-center text-white">{title}</h2>
      <ul className="type-body-small mt-3 flex flex-col items-start gap-2 leading-6 text-white/75">
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
