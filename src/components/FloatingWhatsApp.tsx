"use client";

import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { siteConfig } from "@/config/site";

const message = encodeURIComponent(siteConfig.whatsapp.message);
const whatsappUrl = `https://wa.me/${siteConfig.whatsapp.number}?text=${message}`;

export function FloatingWhatsApp() {
  const pathname = usePathname();

  // Do not show floating WhatsApp on admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }
  return (
    <div className="group fixed bottom-4 right-4 z-[60] md:bottom-6 md:right-6">
      <span
        aria-hidden="true"
        className="whatsapp-pulse pointer-events-none absolute inset-0 rounded-full"
      />
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with RailAgents on WhatsApp"
        className="relative flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_5px_18px_rgba(15,39,71,0.2),0_0_18px_rgba(37,211,102,0.18)] transition duration-200 ease-out hover:scale-105 hover:shadow-[0_7px_22px_rgba(15,39,71,0.24),0_0_22px_rgba(37,211,102,0.24)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#25D366] md:h-14 md:w-14"
      >
        <FaWhatsapp aria-hidden="true" className="h-7 w-7 md:h-8 md:w-8" />
      </a>
      <div className="pointer-events-none absolute bottom-1/2 right-full mr-3 hidden w-max translate-y-1/2 translate-x-1 rounded-xl border border-[#f1dfcb] bg-white px-4 py-3 text-sm text-[var(--navy)] opacity-0 shadow-[0_8px_28px_rgba(15,39,71,0.14)] transition duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-within:translate-x-0 group-focus-within:opacity-100 md:block">
        <p className="font-bold">Need help?</p>
        <p className="mt-0.5 text-xs text-slate-600">Chat with us on WhatsApp</p>
      </div>
    </div>
  );
}
