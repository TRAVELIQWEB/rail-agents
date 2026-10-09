import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { guides } from "@/data/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/ask-nihal`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/irctc-agent-registration`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/videos`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/guides`, changeFrequency: "weekly", priority: 0.8 },
    ...guides.map((guide) => ({
      url: `${siteConfig.url}/guides/${guide.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
