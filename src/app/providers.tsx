
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function PostHogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [posthogReady, setPosthogReady] = useState(false);

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    if (!posthogKey) return;

    let timer: number | undefined;
    let cancelled = false;

    const initializePostHog = () => {
      timer = window.setTimeout(() => {
        void import("posthog-js").then(({ default: posthog }) => {
          if (cancelled) return;

          posthog.init(posthogKey, {
            api_host:
              process.env.NEXT_PUBLIC_POSTHOG_HOST ||
              "https://us.i.posthog.com",
            defaults: "2025-05-24",
            capture_pageview: false,
            capture_pageleave: true,
            disable_session_recording: false,
          });
          setPosthogReady(true);
        });
      }, 1500);
    };

    if (document.readyState === "complete") {
      initializePostHog();
    } else {
      window.addEventListener("load", initializePostHog, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", initializePostHog);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!posthogReady || !pathname) return;

    void import("posthog-js").then(({ default: posthog }) => {
      if (!posthog.__loaded) return;

      posthog.capture("$pageview", {
        $current_url: window.location.href,
      });
    });
  }, [pathname, posthogReady]);

  return <>{children}</>;
}
