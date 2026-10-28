// Blog post types for RailAgents admin + public blog system

export type PostStatus = "draft" | "published" | "scheduled";

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML from Tiptap
  featuredImage: string | null;
  featuredVideoUrl?: string | null;
  category: string;
  tags: string[];
  author: string;
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string | null;
  focusKeyphrase?: string;
  allowIndexing?: boolean;
  featuredImageAlt?: string;
  relatedPostIds?: string[];
  status: PostStatus;
  publishedAt: string | null; // ISO string
  scheduledAt: string | null; // ISO string
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type BlogPostSummary = Pick<
  BlogPost,
  | "id"
  | "title"
  | "slug"
  | "excerpt"
  | "featuredImage"
  | "featuredVideoUrl"
  | "category"
  | "tags"
  | "author"
  | "status"
  | "publishedAt"
  | "createdAt"
  | "updatedAt"
>;

export type CreatePostInput = Omit<BlogPost, "id" | "createdAt" | "updatedAt">;
export type UpdatePostInput = Partial<CreatePostInput>;

export const BLOG_CATEGORIES = [
  "Railway Guide",
  "IRCTC Agent",
  "Booking Tips",
  "Tatkal",
  "Cancellation & Refund",
  "Business Tips",
  "Travel Guide",
  "News & Updates",
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];
