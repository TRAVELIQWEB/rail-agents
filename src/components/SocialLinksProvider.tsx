"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SocialLinks } from "@/lib/social";

const SocialLinksContext = createContext<SocialLinks | null>(null);

export function SocialLinksProvider({ links, children }: { links: SocialLinks; children: ReactNode }) {
  return <SocialLinksContext.Provider value={links}>{children}</SocialLinksContext.Provider>;
}

export function useSocialLinks() {
  const links = useContext(SocialLinksContext);
  if (!links) throw new Error("SocialLinksProvider is required");
  return links;
}
