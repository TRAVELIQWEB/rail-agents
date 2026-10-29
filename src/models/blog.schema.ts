import type { CreatePostInput, PostStatus } from "@/types/blog";

export interface FieldValidationRule {
  required?: boolean;
  unique?: boolean;
  default?: unknown;
  type: "string" | "number" | "boolean" | "array" | "date";
  message?: string;
}

/**
 * Central Blog Schema Definition
 * Analogous to schema.ts in NestJS or Mongoose Schema in Express.
 * Defines all fields, types, mandatory/required constraints, uniqueness, and defaults.
 */
export const BlogSchemaDefinition = {
  id: { type: "string", required: true, unique: true },
  title: { type: "string", required: true, message: "Title is mandatory." },
  slug: { 
    type: "string", 
    required: true, 
    unique: true, 
    message: "Slug is mandatory and must be unique." 
  },
  excerpt: { type: "string", required: false, default: "" },
  content: { type: "string", required: true, message: "Content is mandatory." },
  featuredImage: { type: "string", required: false, default: null },
  featuredVideoUrl: { type: "string", required: false, default: null },
  category: { type: "string", required: true, default: "Railway Guide", message: "Category is mandatory." },
  tags: { type: "array", required: false, default: [] },
  author: { type: "string", required: true, default: "Nihal Singh", message: "Author is mandatory." },
  seoTitle: { type: "string", required: false, default: "" },
  metaDescription: { type: "string", required: false, default: "" },
  canonicalUrl: { type: "string", required: false, default: null },
  focusKeyphrase: { type: "string", required: false, default: "" },
  allowIndexing: { type: "boolean", required: false, default: true },
  featuredImageAlt: { type: "string", required: false, default: "" },
  relatedPostIds: { type: "array", required: false, default: [] },
  status: { 
    type: "string", 
    required: true, 
    default: "draft" as PostStatus,
    enum: ["draft", "published", "scheduled"] 
  },
  publishedAt: { type: "date", required: false, default: null },
  scheduledAt: { type: "date", required: false, default: null },
  createdAt: { type: "date", required: true },
  updatedAt: { type: "date", required: true },
} as const;

/**
 * Validates and applies defaults to CreatePostInput
 */
export function validateAndNormalizePost(input: Partial<CreatePostInput>): CreatePostInput {
  const errors: string[] = [];

  // Required checks
  if (!input.title || typeof input.title !== "string" || !input.title.trim()) {
    errors.push("Title is required.");
  }

  if (!input.slug || typeof input.slug !== "string" || !input.slug.trim()) {
    errors.push("Slug is required.");
  } else {
    // Normalise slug: lowercase, hyphens, alphanumeric only
    input.slug = input.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-");
  }

  if (!input.category || typeof input.category !== "string" || !input.category.trim()) {
    errors.push("Category is required.");
  }

  if (!input.author || typeof input.author !== "string" || !input.author.trim()) {
    input.author = "Nihal Singh"; // apply default
  }

  if (!input.featuredImage && !input.featuredVideoUrl) {
    errors.push("A featured image or YouTube video URL is required.");
  }

  if (errors.length > 0) {
    throw new Error(errors.join(" "));
  }

  // Normalise defaults
  const normalized: CreatePostInput = {
    title: input.title!.trim(),
    slug: input.slug!.trim(),
    excerpt: input.excerpt?.trim() ?? "",
    content: input.content ?? "",
    featuredImage: input.featuredImage ?? null,
    featuredVideoUrl: input.featuredVideoUrl ?? null,
    category: input.category!.trim(),
    tags: Array.isArray(input.tags) ? input.tags : [],
    author: input.author!.trim(),
    seoTitle: input.seoTitle?.trim() || input.title!.trim(),
    metaDescription: input.metaDescription?.trim() || input.excerpt?.trim() || "",
    canonicalUrl: input.canonicalUrl ?? null,
    focusKeyphrase: input.focusKeyphrase?.trim() ?? "",
    allowIndexing: input.allowIndexing !== false,
    featuredImageAlt: input.featuredImageAlt?.trim() ?? "",
    relatedPostIds: Array.isArray(input.relatedPostIds) ? input.relatedPostIds : [],
    status: (input.status && ["draft", "published", "scheduled"].includes(input.status)) 
      ? input.status 
      : "draft",
    publishedAt: input.publishedAt ?? null,
    scheduledAt: input.scheduledAt ?? null,
  };

  return normalized;
}
