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
      className="group inline-flex shrink-0 items-center gap-1.5 xs:gap-2.5 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--primary)]"
    >
      <Image
        src="/images/train logo.png"
        alt="RailAgents train logo mark"
        width={44}
        height={44}
        quality={100}
        className={`${
          isSmall ? "h-7 w-7" : "h-7 w-7 xs:h-8 xs:w-8 sm:h-11 sm:w-11 min-[1180px]:h-9 min-[1180px]:w-9 2xl:h-12 2xl:w-12"
        } shrink-0 object-contain drop-shadow-sm transition-transform duration-200 group-hover:-translate-y-px`}
      />
      <span
        className="type-logo whitespace-nowrap font-extrabold leading-none tracking-[-0.055em]"
      >
        <span className={isLight ? "text-white" : "text-[var(--navy)]"}>Rail</span>
        <span className="text-[var(--primary)]">Agents</span>
      </span>
    </Link>
  );
}
