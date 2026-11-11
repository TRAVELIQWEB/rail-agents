
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import posthog from "posthog-js";

export function PostHogProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

    if (!posthogKey) {
      console.error("PostHog project key is missing.");
      return;
    }

    posthog.init(posthogKey, {
      api_host:
        process.env.NEXT_PUBLIC_POSTHOG_HOST ||
        "https://us.i.posthog.com",
      defaults: "2025-05-24",
      capture_pageview: false,
      disable_session_recording: false,
    });
  }, []);

  useEffect(() => {
    if (!posthog.__loaded || !pathname) return;

    posthog.capture("$pageview", {
      $current_url: window.location.href,
    });
  }, [pathname]);

  return <>{children}</>;
}
