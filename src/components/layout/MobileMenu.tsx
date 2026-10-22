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
  { label: "Fare Calculator", href: "/train-ticket-agent-fare-calculator", isTool: true },
  { label: "Video Guides", href: "/videos" },
  { label: "Guides", href: "/guides" },
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
    <div className="relative flex items-center gap-1 sm:gap-2 min-[1080px]:hidden shrink-0" ref={menuRef}>
      <InternalLink
        href="/train-ticket-agent-fare-calculator"
        prefetch={false}
        aria-label="IRCTC Ticket Fare Calculator"
        title="Fare Calculator"
        className={`h-8 w-8 min-[380px]:h-9 min-[380px]:w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg border border-[var(--primary-border)] bg-orange-50/70 text-[var(--primary-dark)] hover:bg-orange-100/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
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
        className="flex h-8 w-8 min-[380px]:h-9 min-[380px]:w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg border border-[var(--primary-border)] text-[var(--primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
      >
        <MessageCircle aria-hidden="true" className="h-4 w-4 sm:h-5 sm:w-5" />
      </InternalLink>
      <button
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-8 w-8 min-[380px]:h-9 min-[380px]:w-9 sm:h-11 sm:w-11 items-center justify-center rounded-lg border border-[var(--primary-border)] text-[var(--navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] cursor-pointer"
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
              const isCalc =
                item.href === "/train-ticket-agent-fare-calculator" ||
                item.href === "/fare-calculator";
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

              return (
                <InternalLink
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  current={isActive}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-[600] transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${
                    isActive
                      ? "bg-[var(--primary-soft)] text-[var(--primary-dark)]"
                      : isCalc
                      ? "bg-orange-50/60 text-[var(--primary-dark)] font-bold"
                      : "text-[var(--body-text)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isCalc ? <Calculator className="h-4 w-4 text-[var(--primary)]" /> : null}
                    <span>{item.label}</span>
                  </span>
                  {isCalc ? (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[var(--primary-dark)]">
                      Tool
                    </span>
                  ) : null}
                </InternalLink>
              );
            })}
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
