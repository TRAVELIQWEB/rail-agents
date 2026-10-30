import { siteConfig } from "@/config/site";

export const SCHEMA_CONSTANTS = {
  ORGANIZATION_ID: `${siteConfig.url}/#organization`,
  WEBSITE_ID: `${siteConfig.url}/#website`,
  AUTHOR_NIHAL_ID: `${siteConfig.url}/about#nihal-singh`,
} as const;

/**
 * Safely stringifies JSON-LD data and escapes '<' characters to prevent XSS / HTML parser breaks.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

