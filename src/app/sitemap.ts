import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { guides } from "@/data/guides";
import { getPublishedPosts } from "@/lib/posts";

export const revalidate = 3600; // revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publishedPosts = await getPublishedPosts();

  return [
    { url: `${siteConfig.url}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/blog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteConfig.url}/ask-nihal`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${siteConfig.url}/irctc-agent-registration`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${siteConfig.url}/irctc-agent-rules-regulations`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/train-ticket-agent-fare-calculator`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteConfig.url}/videos`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteConfig.url}/guides`, changeFrequency: "weekly", priority: 0.8 },
    ...guides.map((guide) => ({
      url: `${siteConfig.url}/guides/${guide.slug}`,
      changeFrequency: "monthly" as const,
      lastModified: new Date(`${guide.updatedAt}T00:00:00.000Z`),
      priority: 0.6,
    })),
    ...publishedPosts
      .filter(
        (post) =>
          post.allowIndexing !== false &&
          (!post.canonicalUrl ||
            post.canonicalUrl === `${siteConfig.url}/blog/${post.slug}`),
      )
      .map((post) => ({
        url: `${siteConfig.url}/blog/${post.slug}`,
        changeFrequency: "monthly" as const,
        lastModified: new Date(post.updatedAt),
        priority: 0.7,
      })),
  ];
}
