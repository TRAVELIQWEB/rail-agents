"use client";

import React, { ComponentPropsWithoutRef } from "react";
import Link from "next/link";

type InteractiveButtonBaseProps = {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  variant?: "orange" | "secondary" | "dark";
  size?: "sm" | "md" | "lg";
  className?: string;
};

type InteractiveButtonAsButton = InteractiveButtonBaseProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof InteractiveButtonBaseProps> & {
    as?: "button";
    href?: never;
  };

type InteractiveButtonAsLink = InteractiveButtonBaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof InteractiveButtonBaseProps> & {
    as: "link";
    href: string;
  };

type InteractiveButtonProps = InteractiveButtonAsButton | InteractiveButtonAsLink;

export function InteractiveButton(props: InteractiveButtonProps) {
  const {
    label,
    sublabel,
    icon,
    variant = "orange",
    size = "md",
    className = "",
    as = "button",
    ...rest
  } = props;

  const sizeClass =
    size === "sm"
      ? "uiverse-cta-sm"
      : size === "lg"
      ? "uiverse-cta-lg"
      : "uiverse-cta-md";

  const variantClass =
    variant === "secondary"
      ? "uiverse-cta-secondary"
      : variant === "dark"
      ? "uiverse-cta-dark"
      : "uiverse-cta-orange";

  const combinedClass = `uiverse-btn single-line-btn ${sizeClass} ${variantClass} ${className}`;

  const innerContent = (
    <>
      <span className="uiverse-bg" aria-hidden="true" />
      <span className="uiverse-wrap">
        <span className="uiverse-outline" aria-hidden="true" />
        <span className="uiverse-content">
          <span className="uiverse-words">
            <span className={sublabel ? "uiverse-label uiverse-label-with-sublabel" : "uiverse-label"}>
              {label}
            </span>
            {sublabel ? (
              <span className="uiverse-sublabel" aria-hidden="true">
                {sublabel}
              </span>
            ) : null}
          </span>

          {icon ? (
            <span className="uiverse-custom-icon" aria-hidden="true">
              {icon}
            </span>
          ) : (
            <span className="uiverse-icon" aria-hidden="true">
              <div />
            </span>
          )}
        </span>
      </span>
    </>
  );

  if (as === "link") {
    const linkProps = rest as ComponentPropsWithoutRef<typeof Link>;
    return (
      <Link className={combinedClass} {...linkProps}>
        {innerContent}
      </Link>
    );
  }

  const buttonProps = rest as ComponentPropsWithoutRef<"button">;
  return (
    <button type={buttonProps.type || "button"} className={combinedClass} {...buttonProps}>
      {innerContent}
    </button>
  );
}
