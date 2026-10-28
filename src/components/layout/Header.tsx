"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, Calculator, Sparkles } from "lucide-react";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Logo } from "@/components/layout/Logo";
import { SearchForm } from "@/components/layout/SearchForm";
import { InternalLink } from "@/components/ui/InternalLink";
import { InteractiveButton } from "@/components/ui/InteractiveButton";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "IRCTC Agent", href: "/irctc-agent-registration" },
  { label: "Blog", href: "/blog" },
  { label: "Guides", href: "/guides" },
];

const utilityTools = [
  {
    title: "Train Ticket Fare Calculator",
    href: "/train-ticket-agent-fare-calculator",
    description: "Complete fare estimation with IRCTC & agent service fee breakdown",
    badge: "Popular Tool",
  },
];

export function Header() {
  const pathname = usePathname();
  const [utilitiesOpen, setUtilitiesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isUtilityActive =
    pathname === "/train-ticket-agent-fare-calculator" ||
    pathname === "/fare-calculator";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUtilitiesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-[#f4e4d4]/80 bg-[#fffdfa]/95 backdrop-blur-md shadow-[0_2px_15px_rgba(249,115,22,0.04)]">
      <div className="site-container grid h-[60px] sm:h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-1.5 sm:gap-2.5 min-[1080px]:grid-cols-[auto_minmax(0,1fr)_auto] min-[1080px]:gap-3 xl:gap-4 2xl:h-[78px]">
        <div className="justify-self-start min-w-0">
          <Logo />
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden min-w-0 items-center justify-self-center gap-1 min-[1080px]:flex xl:gap-2"
        >
          {navItems.slice(0, 3).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <InternalLink
                key={item.href}
                href={item.href}
                prefetch={false}
                current={isActive}
                className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-1.5 text-[14px] font-[600] leading-none transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] xl:px-2.5 xl:text-[15px] min-[1440px]:text-[16px] ${
                  isActive
                    ? "bg-[#ffefe6] text-[var(--primary)] shadow-xs"
                    : "text-[var(--navy)] hover:bg-[#fff7f0] hover:text-[var(--primary)]"
                }`}
              >
                <span>{item.label}</span>
              </InternalLink>
            );
          })}

          {/* ── Tools Dropdown (Same appearance as other nav links, active only when on calculator page) ── */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setUtilitiesOpen(true)}
            onMouseLeave={() => setUtilitiesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setUtilitiesOpen((prev) => !prev)}
              aria-expanded={utilitiesOpen}
              aria-haspopup="true"
              className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-1.5 text-[14px] font-[600] leading-none transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] xl:px-2.5 xl:text-[15px] min-[1440px]:text-[16px] cursor-pointer ${
                isUtilityActive
                  ? "bg-[#ffefe6] text-[var(--primary)] shadow-xs"
                  : "text-[var(--navy)] hover:bg-[#fff7f0] hover:text-[var(--primary)]"
              }`}
            >
              <span>Tools</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  utilitiesOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Card */}
            <div
              className={`absolute left-1/2 top-full -translate-x-1/2 pt-2 transition-all duration-200 ${
                utilitiesOpen
                  ? "opacity-100 visible translate-y-0"
                  : "opacity-0 invisible -translate-y-1 pointer-events-none"
              }`}
            >
              <div className="w-[330px] rounded-2xl border border-[#fed7aa] bg-white p-2.5 shadow-[0_16px_36px_rgba(234,88,12,0.12),0_4px_12px_rgba(0,0,0,0.06)]">
                <div className="px-2.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                  Agent Tools &amp; Calculators
                </div>

                {utilityTools.map((tool) => (
                  <InternalLink
                    key={tool.href}
                    href={tool.href}
                    prefetch={false}
                    onClick={() => setUtilitiesOpen(false)}
                    className="group flex items-start gap-3 rounded-xl p-2.5 transition-all hover:bg-orange-50/80"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-[var(--primary)] transition-transform group-hover:scale-105">
                      <Calculator className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900 group-hover:text-[var(--primary)] transition-colors">
                          {tool.title}
                        </span>
                        {tool.badge && (
                          <span className="rounded bg-orange-100/90 px-1.5 py-0.2 text-[9px] font-extrabold text-[var(--primary-dark)]">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-stone-500">
                        {tool.description}
                      </p>
                    </div>
                  </InternalLink>
                ))}
              </div>
            </div>
          </div>

          {/* Remaining Nav Items */}
          {navItems.slice(3).map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <InternalLink
                key={item.href}
                href={item.href}
                prefetch={false}
                current={isActive}
                className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-1.5 text-[14px] font-[600] leading-none transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] xl:px-2.5 xl:text-[15px] min-[1440px]:text-[16px] ${
                  isActive
                    ? "bg-[#ffefe6] text-[var(--primary)] shadow-xs"
                    : "text-[var(--navy)] hover:bg-[#fff7f0] hover:text-[var(--primary)]"
                }`}
              >
                <span>{item.label}</span>
              </InternalLink>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 justify-self-end min-[1080px]:flex xl:gap-3">
          <SearchForm />
          <InteractiveButton
            as="link"
            href="/contact"
            label="Contact Us"
            size="sm"
            variant="orange"
          />
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}
