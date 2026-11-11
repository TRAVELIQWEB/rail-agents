"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { railTools } from "@/config/tools";
import { siteConfig } from "@/config/site";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Logo } from "@/components/layout/Logo";
import { InternalLink } from "@/components/ui/InternalLink";

const message = encodeURIComponent(siteConfig.whatsapp.message);
const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${message}`;

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Guides", href: "/guides" },
  { label: "Tools", href: "/tools" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#E5EAF0] bg-white/95 backdrop-blur-md shadow-[0_2px_15px_rgba(15,39,71,0.04)]">
      <div className="site-container flex h-[64px] sm:h-[72px] items-center justify-between gap-4">
        <div className="flex shrink-0 items-center">
          <Logo />
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden min-w-0 items-center gap-1 min-[1080px]:flex xl:gap-2"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            if (item.href === "/tools") {
              return (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => setToolsOpen(true)}
                  onMouseLeave={() => setToolsOpen(false)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) setToolsOpen(false);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      event.stopPropagation();
                      event.currentTarget.querySelector<HTMLAnchorElement>("a")?.focus();
                      setToolsOpen(false);
                    }
                  }}
                >
                  <Link
                    href="/tools"
                    prefetch={false}
                    aria-current={isActive ? "page" : undefined}
                    aria-expanded={toolsOpen}
                    aria-controls="header-tools-links"
                    onFocus={() => setToolsOpen(true)}
                    onClick={() => setToolsOpen(false)}
                    className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1.5 text-[14px] font-[600] leading-none transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] xl:px-3 xl:text-[15px] min-[1440px]:text-[16px] ${isActive
                      ? "bg-[#ffefe6] text-[var(--primary)] shadow-xs"
                      : "text-[var(--navy)] hover:bg-[#fff7f0] hover:text-[var(--primary)]"
                    }`}
                  >
                    Tools
                  </Link>
                  {toolsOpen && (
                    <div id="header-tools-links" className="absolute left-1/2 top-full w-64 -translate-x-1/2 pt-3">
                      <ul aria-label="Railway tools" className="space-y-1 rounded-2xl border border-orange-100 bg-white p-2 shadow-[0_8px_30px_rgba(15,39,71,0.12)]">
                        {[{ href: "/tools", shortTitle: "All Railway Tools" }, ...railTools].map((tool) => (
                          <li key={tool.href}>
                            <Link
                              href={tool.href}
                              prefetch={false}
                              aria-current={pathname === tool.href ? "page" : undefined}
                              onClick={() => setToolsOpen(false)}
                              className={`block rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-orange-50 hover:text-[#C6530A] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#F36B21] ${pathname === tool.href ? "bg-orange-50 text-[#C6530A]" : "text-[var(--navy)]"}`}
                            >
                              {tool.shortTitle}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <InternalLink
                key={item.href}
                href={item.href}
                prefetch={false}
                current={isActive}
                className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1.5 text-[14px] font-[600] leading-none transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] xl:px-3 xl:text-[15px] min-[1440px]:text-[16px] ${isActive
                  ? "bg-[#ffefe6] text-[var(--primary)] shadow-xs"
                  : "text-[var(--navy)] hover:bg-[#fff7f0] hover:text-[var(--primary)]"
                  }`}
              >
                <span>{item.label}</span>
              </InternalLink>
            );
          })}
        </nav>

        {/* Rightmost: WhatsApp Us Button */}
        <div className="hidden shrink-0 items-center justify-self-end min-[1080px]:flex">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with RailAgents on WhatsApp"
            className="inline-flex h-[38px] xl:h-[40px] items-center gap-2 rounded-full bg-[#25D366] px-4 xl:px-5 text-xs xl:text-sm font-bold text-white shadow-[0_2px_10px_rgba(37,211,102,0.25)] transition-all duration-150 hover:bg-[#20ba5a] hover:shadow-[0_4px_16px_rgba(37,211,102,0.35)] hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
          >
            <FaWhatsapp className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
            <span>WhatsApp Us</span>
          </a>
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}
