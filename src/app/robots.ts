import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin",
          "/api/admin/",
          "/api/posts",
          "/api/upload",
          "/wp-admin/",
          "/wp-content/",
          "/wp-includes/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: [
          "/admin/",
          "/admin",
          "/api/admin/",
          "/api/posts",
          "/api/upload",
          "/wp-admin/",
          "/wp-content/",
          "/wp-includes/",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
