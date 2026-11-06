import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { guides } from "@/data/guides";
import { getPublishedPosts } from "@/lib/posts";

export const revalidate = 3600; // revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedPosts = await getPublishedPosts();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${siteConfig.url}/live-train-status`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/pnr-status`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/guides`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/tools`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/train-ticket-agent-fare-calculator`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/ticket-date-calculator`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/train-chart-preparation-time`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/irctc-cancellation-refund-calculator`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/irctc-agent-registration`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/irctc-principal-service-providers-updated-29-03-2025`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/irctc-agent-rules-regulations`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/refund-process-for-wrong-mobile-number`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/ask-nihal`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/videos`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${siteConfig.url}/terms`, changeFrequency: "monthly", priority: 0.5 },
  ];

  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${siteConfig.url}/guides/${guide.slug}`,
    changeFrequency: "monthly",
    lastModified: new Date(`${guide.updatedAt}T00:00:00.000Z`),
    priority: 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = publishedPosts
    .filter(
      (post) =>
        post.allowIndexing !== false &&
        (!post.canonicalUrl || post.canonicalUrl === `${siteConfig.url}/blog/${post.slug}`),
    )
    .map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}`,
      changeFrequency: "monthly",
      lastModified: new Date(post.updatedAt),
      priority: 0.7,
    }));

  return [...staticRoutes, ...guideRoutes, ...blogRoutes];
}
