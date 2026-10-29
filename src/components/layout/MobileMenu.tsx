"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Calculator, Menu, MessageCircle, X } from "lucide-react";
import { SearchForm } from "@/components/layout/SearchForm";
import { InternalLink } from "@/components/ui/InternalLink";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "IRCTC Agent", href: "/irctc-agent-registration" },
  { label: "Blog", href: "/blog" },
  { label: "Guides", href: "/guides" },
];

const utilityItems = [
  { label: "Train Ticket Fare Calculator", href: "/train-ticket-agent-fare-calculator", isTool: true },
];
export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const isCalcPage =
    pathname === "/train-ticket-agent-fare-calculator" ||
    pathname === "/fare-calculator";

  return (
    <div className="relative flex shrink-0 items-center gap-1 sm:gap-2 min-[1080px]:hidden" ref={menuRef}>
      <InternalLink
        href="/train-ticket-agent-fare-calculator"
        prefetch={false}
        aria-label="IRCTC Ticket Fare Calculator"
        title="Fare Calculator"
        className={`flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--primary-border)] bg-orange-50/70 text-[var(--primary-dark)] hover:bg-orange-100/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
          isCalcPage ? "hidden min-[380px]:flex" : "flex"
        }`}
      >
        <Calculator aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
      </InternalLink>
      <InternalLink
        href="/contact"
        prefetch={false}
        aria-label="Contact RailAgents"
        title="Contact Us"
        className="flex h-11 w-11 items-center justify-center rounded-lg border border-[var(--primary-border)] text-[var(--primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
      >
        <MessageCircle aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
      </InternalLink>
      <button
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
        className={`icon-action flex h-11 w-11 cursor-pointer items-center justify-center border border-[var(--primary-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
          isOpen
            ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] hover:text-white"
            : ""
        }`}
      >
        {isOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
      </button>

      {isOpen ? (
        <div
          id="mobile-navigation"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-[var(--primary-border)] bg-white p-4 shadow-[0_20px_48px_rgba(18,48,85,0.16)]"
        >
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

              return (
                <InternalLink
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  current={isActive}
                  onClick={() => setIsOpen(false)}
                  className={`flex min-h-11 items-center justify-between rounded-lg px-3 py-2 text-base font-[600] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${
                    isActive
                      ? "bg-[var(--primary-soft)] text-[var(--primary-dark)]"
                      : "text-[var(--body-text)]"
                  }`}
                >
                  <span>{item.label}</span>
                </InternalLink>
              );
            })}

            {/* Tools Subgroup */}
            <div className="pt-2 mt-1 border-t border-slate-100">
              <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-1">
                Tools &amp; Calculators
              </span>
              {utilityItems.map((tool) => {
                const isToolActive =
                  pathname === tool.href ||
                  (tool.href === "/train-ticket-agent-fare-calculator" && pathname === "/fare-calculator");

                return (
                  <InternalLink
                    key={tool.href}
                    href={tool.href}
                    prefetch={false}
                    current={isToolActive}
                    onClick={() => setIsOpen(false)}
                    className={`flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-[650] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${
                      isToolActive
                        ? "bg-[var(--primary-soft)] text-[var(--primary-dark)] font-bold"
                        : "text-[var(--navy)]"
                    }`}
                  >
                    <Calculator className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                    <span>{tool.label}</span>
                  </InternalLink>
                );
              })}
            </div>
          </nav>

          <div className="mt-3">
            <SearchForm mobile />
          </div>

          <InternalLink
            href="/contact"
            prefetch={false}
            onClick={() => setIsOpen(false)}
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--primary)] px-4 py-2.5 text-[0.9375rem] font-semibold text-white shadow-[0_10px_22px_rgba(249,115,22,0.22)] transition-all duration-200 hover:-translate-y-px hover:bg-[var(--primary-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            Contact Us
          </InternalLink>
        </div>
      ) : null}
    </div>
  );
}
