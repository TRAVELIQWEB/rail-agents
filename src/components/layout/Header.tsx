"use client";

import { usePathname } from "next/navigation";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Logo } from "@/components/layout/Logo";
import { SearchForm } from "@/components/layout/SearchForm";
import { InternalLink } from "@/components/ui/InternalLink";
import { InteractiveButton } from "@/components/ui/InteractiveButton";

const navItems = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "IRCTC Agent", href: "/irctc-agent-registration" },
  { label: "Tools", href: "/tools" },
  { label: "Blog", href: "/blog" },
  { label: "Guides", href: "/guides" },
];

export function Header() {
  const pathname = usePathname();

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
                className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-1.5 text-[14px] font-[600] leading-none transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] xl:px-2.5 xl:text-[15px] min-[1440px]:text-[16px] ${isActive
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
