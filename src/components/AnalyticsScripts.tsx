
"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export function AnalyticsScripts() {
  const pathname = usePathname();
  if (pathname === "/pnr-status" || pathname.startsWith("/pnr-status/")) return null;

  return <>
    <Script
      id="next-gtm-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html:
          "(function(w,l){if(w.location&&w.location.pathname.indexOf('/admin')===0)return;w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});})(window,'dataLayer');",
      }}
    />
    <Script
      id="next-gtm"
      src="https://www.googletagmanager.com/gtm.js?id=GTM-P3CML7MM"
      strategy="lazyOnload"
    />
  </>;
}
