import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { isInternalRouteAvailable } from "@/config/routes";

type InternalLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: MouseEventHandler<HTMLElement>;
  prefetch?: boolean;
  current?: boolean;
  title?: string;
  "aria-label"?: string;
};

export function InternalLink({
  href,
  children,
  className = "",
  onClick,
  prefetch = false,
  current,
  title,
  "aria-label": ariaLabel,
}: InternalLinkProps) {
  if (!isInternalRouteAvailable(href)) {
    const disabledClassName = className
      .split(/\s+/)
      .filter((className) => className !== "group" && !className.includes("hover:"))
      .join(" ");

    return (
      <span
        aria-disabled="true"
        title={title ?? "Coming Soon"}
        onClick={onClick}
        className={`${disabledClassName} cursor-not-allowed`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      prefetch={prefetch}
      aria-current={current ? "page" : undefined}
      aria-label={ariaLabel}
      onClick={onClick as MouseEventHandler<HTMLAnchorElement> | undefined}
      className={className}
      title={title}
    >
      {children}
    </Link>
  );
}
