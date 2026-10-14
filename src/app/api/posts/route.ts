// GET /api/posts — list posts (admin: all; public: published only)
// POST /api/posts — create a new post (admin only)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminIronSession } from "@/lib/auth";
import { getAllPosts, createPost, getPublishedPosts } from "@/lib/posts";
import { sanitizeHtml, sanitizeText } from "@/lib/sanitize";
import type { CreatePostInput } from "@/types/blog";

async function isAdmin() {
  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);
  return !!session.admin?.isLoggedIn;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const admin = await isAdmin();

  if (admin) {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  }

  // Public: return only published posts with summary fields
  const published = await getPublishedPosts();
  const summaries = published.map(({ id, title, slug, excerpt, featuredImage, category, tags, author, status, publishedAt, createdAt, updatedAt }) => ({
    id, title, slug, excerpt, featuredImage, category, tags, author, status, publishedAt, createdAt, updatedAt,
  }));
  return NextResponse.json(summaries);
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: CreatePostInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Sanitize
  body.content = sanitizeHtml(body.content ?? "");
  body.title = sanitizeText(body.title ?? "");
  body.excerpt = sanitizeText(body.excerpt ?? "");
  body.seoTitle = sanitizeText(body.seoTitle ?? "");
  body.metaDescription = sanitizeText(body.metaDescription ?? "");
  body.focusKeyphrase = sanitizeText(body.focusKeyphrase ?? "");
  body.featuredImageAlt = sanitizeText(body.featuredImageAlt ?? "");
  body.relatedPostIds = Array.isArray(body.relatedPostIds)
    ? body.relatedPostIds.filter((id): id is string => typeof id === "string").map((id) => id.trim()).filter(Boolean)
    : [];
  body.allowIndexing = body.allowIndexing !== false;
  body.canonicalUrl = typeof body.canonicalUrl === "string" ? sanitizeText(body.canonicalUrl) : null;

  if (body.canonicalUrl) {
    try {
      const canonical = new URL(body.canonicalUrl);
      if (canonical.protocol !== "https:" && canonical.protocol !== "http:") throw new Error("Invalid protocol");
    } catch {
      return NextResponse.json({ error: "Canonical URL must be a valid HTTP or HTTPS URL." }, { status: 422 });
    }
  }

  if (!body.title?.trim()) return NextResponse.json({ error: "Title is required." }, { status: 422 });
  if (!body.slug?.trim()) return NextResponse.json({ error: "Slug is required." }, { status: 422 });
  if (!body.featuredImage) return NextResponse.json({ error: "Featured image is required." }, { status: 422 });
  if (!body.category?.trim()) return NextResponse.json({ error: "Category is required." }, { status: 422 });
  if (!body.author?.trim()) return NextResponse.json({ error: "Author is required." }, { status: 422 });

  try {
    const post = await createPost(body);
    return NextResponse.json(post, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
}

