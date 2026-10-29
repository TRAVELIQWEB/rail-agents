// GET /api/posts — list posts (admin: all; public: published only)
// POST /api/posts — create a new post (admin only)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAdminIronSession, isAdminUiPreviewEnabled } from "@/lib/auth";
import { isAdminSessionValid } from "@/lib/admin-session-validation";
import { getAllPosts, createPost, getPublishedPosts } from "@/lib/posts";
import { sanitizeHtml, sanitizeText } from "@/lib/sanitize";
import type { CreatePostInput } from "@/types/blog";

async function isAdmin() {
  if (isAdminUiPreviewEnabled()) return true;

  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);

  return isAdminSessionValid(session.admin);
}

export async function GET() {
  const admin = await isAdmin();

  if (admin) {
    const posts = await getAllPosts();
    return NextResponse.json(posts);
  }

  // Public: return only published posts with summary fields
  const published = await getPublishedPosts();
  const summaries = published.map(({ id, title, slug, excerpt, featuredImage, featuredVideoUrl, socialLinks, category, tags, author, status, publishedAt, createdAt, updatedAt }) => ({
    id, title, slug, excerpt, featuredImage, featuredVideoUrl, socialLinks, category, tags, author, status, publishedAt, createdAt, updatedAt,
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
  body.featuredVideoUrl = typeof body.featuredVideoUrl === "string" ? sanitizeText(body.featuredVideoUrl) : null;
  if (body.socialLinks && typeof body.socialLinks === "object") {
    body.socialLinks = {
      instagram: typeof body.socialLinks.instagram === "string" && body.socialLinks.instagram.trim()
        ? sanitizeText(body.socialLinks.instagram.trim())
        : null,
      facebook: typeof body.socialLinks.facebook === "string" && body.socialLinks.facebook.trim()
        ? sanitizeText(body.socialLinks.facebook.trim())
        : null,
      youtube: typeof body.socialLinks.youtube === "string" && body.socialLinks.youtube.trim()
        ? sanitizeText(body.socialLinks.youtube.trim())
        : null,
    };
  } else {
    body.socialLinks = null;
  }
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
  if (!body.featuredImage && !body.featuredVideoUrl) return NextResponse.json({ error: "A featured image or YouTube video is required." }, { status: 422 });
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
