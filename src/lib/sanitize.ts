// Server-side HTML sanitizer using isomorphic-dompurify
// Safe to import in both server components and API routes

import DOMPurify from "isomorphic-dompurify";

// Allowed tags and attributes for blog content
const ALLOWED_TAGS = [
  "p", "br", "strong", "b", "em", "i", "u", "s", "del",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "blockquote", "pre", "code",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
  "hr", "figure", "figcaption",
  "mark", "span", "div",
  "iframe",
];

export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [
      "href", "target", "rel", "title",
      "src", "alt", "width", "height", "loading",
      "colspan", "rowspan",
      "class", "style",
      "allowfullscreen", "allow", "frameborder",
    ],
    // Force links to be safe
    ADD_ATTR: ["target"],
    // Remove script, object, embed, form, input
    FORBID_TAGS: ["script", "object", "embed", "form", "input"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  });
}

export function sanitizeText(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

