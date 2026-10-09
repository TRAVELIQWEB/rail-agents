import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  variant?: "default" | "light";
  size?: "default" | "small";
};

export function Logo({ variant = "default", size = "default" }: LogoProps) {
  const isLight = variant === "light";
  const isSmall = size === "small";

  return (
    <Link
      href="/"
      aria-label="RailAgents home"
      className="group inline-flex shrink-0 items-center gap-2.5 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
    >
      <Image
        src="/images/train logo.png"
        alt="RailAgents train logo mark"
        width={44}
        height={44}
        quality={100}
        priority
        className={`${
          isSmall ? "h-8 w-8" : "h-9 w-9 sm:h-11 sm:w-11 min-[1180px]:h-9 min-[1180px]:w-9 2xl:h-12 2xl:w-12"
        } shrink-0 object-contain drop-shadow-sm transition-transform duration-200 group-hover:-translate-y-px`}
      />
      <span
        className={`whitespace-nowrap font-[800] leading-none tracking-[-0.055em] ${
          isSmall ? "text-[1.25rem]" : "text-[1.55rem] sm:text-[1.75rem] min-[1180px]:text-[1.25rem] xl:text-[1.5rem] 2xl:text-[1.875rem] wide:text-[2rem]"
        }`}
      >
        <span className={isLight ? "text-white" : "text-[var(--navy)]"}>Rail</span>
        <span className="text-[var(--primary)]">Agents</span>
      </span>
    </Link>
  );
}
