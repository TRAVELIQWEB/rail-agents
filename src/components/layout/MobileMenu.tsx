"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Calculator, CalendarDays, Menu, Radio, TicketCheck, TrainFront, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { InternalLink } from "@/components/ui/InternalLink";
import { railTools } from "@/config/tools";
import { WhatsAppLink } from "@/components/WhatsAppSettingsProvider";


const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Guides", href: "/guides" },
  { label: "Tools", href: "/tools" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact" },
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
      if (event.key === "Escape") {
        setIsOpen(false);
        menuRef.current?.querySelector<HTMLButtonElement>("button[aria-controls='mobile-navigation']")?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative flex shrink-0 items-center min-[1080px]:hidden" ref={menuRef}>
      <button
        type="button"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        aria-controls="mobile-navigation"
        onClick={() => setIsOpen((open) => !open)}
        className={`type-navigation icon-action flex h-11 w-11 cursor-pointer items-center justify-center border border-[var(--primary-border)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${isOpen
          ? "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] hover:text-white"
          : ""
          }`}
      >
        {isOpen ? <X className="h-4 w-4 sm:h-5 sm:w-5" /> : <Menu className="h-4 w-4 sm:h-5 sm:w-5" />}
      </button>

      {isOpen ? (
        <div
          id="mobile-navigation"
          className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-[calc(100dvh-6rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-[var(--primary-border)] bg-white p-4 shadow-[0_20px_48px_rgba(18,48,85,0.16)]"
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
                  className={`type-body flex min-h-11 items-center justify-between rounded-lg px-3 py-2 font-semibold transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${isActive
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
              <span className="type-caption px-3 font-extrabold uppercase tracking-wider text-stone-400 block mb-1">
                Tools &amp; Calculators
              </span>
              {railTools.map((tool) => {
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
                    className={`type-body-small flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 font-semibold transition-colors hover:bg-[var(--primary-soft)] hover:text-[var(--primary-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--primary)] ${isToolActive
                      ? "bg-[var(--primary-soft)] text-[var(--primary-dark)] font-bold"
                      : "text-[var(--navy)]"
                      }`}
                  >
                    {tool.icon === "ticket" ? (
                      <TicketCheck className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                    ) : tool.icon === "calendar" ? (
                      <CalendarDays className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                    ) : tool.icon === "radio" ? (
                      <Radio className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                    ) : tool.icon === "train" ? (
                      <TrainFront className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                    ) : (
                      <Calculator className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                    )}
                    <span>{tool.title}</span>
                  </InternalLink>
                );
              })}
            </div>
          </nav>

          <div className="mt-3">
            <WhatsAppLink
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className="type-navigation inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 font-bold text-white shadow-[0_4px_14px_rgba(37,211,102,0.3)] transition-all duration-200 hover:bg-[#20ba5a]"
            >
              <FaWhatsapp className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span>WhatsApp Us</span>
            </WhatsAppLink>
          </div>
        </div>
      ) : null}
    </div>
  );
}
