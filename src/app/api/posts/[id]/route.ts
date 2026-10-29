// GET /api/posts/[id]  — get single post
// PATCH /api/posts/[id] — update post (admin only)
// DELETE /api/posts/[id] — delete post (admin only)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAdminIronSession, isAdminUiPreviewEnabled } from "@/lib/auth";
import { isAdminSessionValid } from "@/lib/admin-session-validation";
import { getPostById, updatePost, deletePost, isPostPubliclyVisible } from "@/lib/posts";
import { sanitizeHtml, sanitizeText } from "@/lib/sanitize";

async function isAdmin() {
  if (isAdminUiPreviewEnabled()) return true;

  const cookieStore = await cookies();
  const session = await getAdminIronSession(cookieStore);

  return isAdminSessionValid(session.admin);
}
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const admin = await isAdmin();
  // Non-admins can only see publicly visible (published or due-scheduled) posts
  if (!admin && !isPostPubliclyVisible(post)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Sanitize modified fields
  if (typeof body.content === "string") body.content = sanitizeHtml(body.content);
  if (typeof body.title === "string") body.title = sanitizeText(body.title);
  if (typeof body.excerpt === "string") body.excerpt = sanitizeText(body.excerpt);
  if (typeof body.seoTitle === "string") body.seoTitle = sanitizeText(body.seoTitle);
  if (typeof body.metaDescription === "string") body.metaDescription = sanitizeText(body.metaDescription);
  if (typeof body.focusKeyphrase === "string") body.focusKeyphrase = sanitizeText(body.focusKeyphrase);
  if (typeof body.featuredImageAlt === "string") body.featuredImageAlt = sanitizeText(body.featuredImageAlt);
  if (typeof body.featuredVideoUrl === "string") body.featuredVideoUrl = sanitizeText(body.featuredVideoUrl);
  if (body.socialLinks && typeof body.socialLinks === "object") {
    const sl = body.socialLinks as Record<string, unknown>;
    body.socialLinks = {
      instagram: typeof sl.instagram === "string" && sl.instagram.trim() ? sanitizeText(sl.instagram.trim()) : null,
      facebook: typeof sl.facebook === "string" && sl.facebook.trim() ? sanitizeText(sl.facebook.trim()) : null,
      youtube: typeof sl.youtube === "string" && sl.youtube.trim() ? sanitizeText(sl.youtube.trim()) : null,
    };
  }
  if (typeof body.canonicalUrl === "string") body.canonicalUrl = sanitizeText(body.canonicalUrl);
  if (Array.isArray(body.relatedPostIds)) {
    body.relatedPostIds = body.relatedPostIds.filter((id): id is string => typeof id === "string").map((id) => id.trim()).filter(Boolean);
  }
  if (typeof body.canonicalUrl === "string" && body.canonicalUrl) {
    try {
      const canonical = new URL(body.canonicalUrl);
      if (canonical.protocol !== "https:" && canonical.protocol !== "http:") throw new Error("Invalid protocol");
    } catch {
      return NextResponse.json({ error: "Canonical URL must be a valid HTTP or HTTPS URL." }, { status: 422 });
    }
  }

  try {
    const updated = await updatePost(id, body as Parameters<typeof updatePost>[1]);
    try {
      revalidatePath("/blog");
      revalidatePath(`/blog/${updated.slug}`);
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation warning on update:", e);
    }
    return NextResponse.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const status = msg === "Post not found." ? 404 : 409;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    const postToDelete = await getPostById(id);
    await deletePost(id);
    try {
      revalidatePath("/blog");
      if (postToDelete?.slug) {
        revalidatePath(`/blog/${postToDelete.slug}`);
      }
      revalidatePath("/sitemap.xml");
    } catch (e) {
      console.warn("Revalidation warning on delete:", e);
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 404 });
  }
}
