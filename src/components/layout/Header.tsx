"use client";

import { usePathname } from "next/navigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Logo } from "@/components/layout/Logo";
import { SearchForm } from "@/components/layout/SearchForm";
import { InternalLink } from "@/components/ui/InternalLink";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "IRCTC Agent", href: "/irctc-agent-registration" },
  { label: "Video Guides", href: "/videos" },
  { label: "Guides", href: "/guides" },
];
export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-[#f4e4d4]/80 bg-[#fffdfa]/95 backdrop-blur-md shadow-[0_2px_15px_rgba(249,115,22,0.04)]">
      <div className="site-container grid h-[72px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 min-[1180px]:grid-cols-[auto_minmax(0,1fr)_auto] min-[1180px]:gap-3 xl:gap-4 2xl:h-[78px]">
        <div className="justify-self-start">
          <Logo />
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden min-w-0 items-center justify-self-center gap-1.5 min-[1180px]:flex xl:gap-2"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(`${item.href}/`));

            return (
              <InternalLink
                key={item.href}
                href={item.href}
                prefetch={false}
                current={isActive}
                className={`whitespace-nowrap rounded-full px-2 py-2 text-[15px] font-[600] leading-none transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] xl:px-2.5 xl:text-[16px] min-[1440px]:text-[17px] ${
                  isActive
                    ? "bg-[#ffefe6] text-[var(--primary)] shadow-sm"
                    : "text-[var(--navy)] hover:bg-[#fff7f0] hover:text-[var(--primary)]"
                }`}
              >
                {item.label}
              </InternalLink>
            );
          })}

        </nav>

        <div className="hidden shrink-0 items-center gap-2 justify-self-end min-[1180px]:flex xl:gap-3">
          <SearchForm />
          <InternalLink
            href="/contact"
            prefetch={false}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[var(--primary)] px-3 py-2 text-[15px] font-[600] leading-none text-white shadow-[0_4px_16px_rgba(249,115,22,0.24)] transition-all duration-200 hover:scale-105 hover:bg-[#e85d04] hover:shadow-[0_6px_22px_rgba(249,115,22,0.32)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] xl:gap-2 xl:px-5 xl:text-[16px] min-[1440px]:text-[17px]"
          >
            Contact Us
          </InternalLink>
        </div>

        <MobileMenu />
      </div>
    </header>
  );
}
