import { siteConfig } from "@/config/site";

/** Page and breadcrumb entities for tool pages without existing page-specific JSON-LD. */
export function ToolPageSchema({ title, description, pathname }: { title: string; description: string; pathname: string }) {
  const url = `${siteConfig.url}${pathname}`;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebPage", "@id": `${url}#webpage`, url, name: title, description, inLanguage: "en-IN", isPartOf: { "@id": `${siteConfig.url}/#website` }, breadcrumb: { "@id": `${url}#breadcrumb` } },
      { "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`, itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/` },
        { "@type": "ListItem", position: 2, name: "Railway Tools", item: `${siteConfig.url}/tools` },
        { "@type": "ListItem", position: 3, name: title, item: url },
      ] },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
