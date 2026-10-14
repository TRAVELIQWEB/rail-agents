"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Save, Send, Eye, Clock, Trash2, ChevronDown, ChevronUp,
  Upload, X, Tag, Globe, User, Calendar, AlertCircle,
} from "lucide-react";
import { BLOG_CATEGORIES } from "@/types/blog";
import type { BlogPost, PostStatus } from "@/types/blog";
import { sanitizeHtml } from "@/lib/sanitize";

// Dynamically import the editor (Tiptap is client-only)
const RichEditor = dynamic(
  () => import("./RichEditor").then((m) => m.RichEditor),
  { ssr: false, loading: () => <div className="min-h-[400px] rounded-2xl border border-slate-200 bg-slate-50 animate-pulse" /> }
);

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type SaveStatus = "saved" | "saving" | "unsaved" | "idle";

interface PostFormProps {
  post?: BlogPost; // if provided, we're editing
  mode: "create" | "edit";
  availablePosts?: Pick<BlogPost, "id" | "title" | "slug" | "status" | "author">[];
}

export function PostForm({ post, mode, availablePosts = [] }: PostFormProps) {
  const router = useRouter();
  const authorOptions = Array.from(new Set([
    "Nihal Singh",
    "RailAgents",
    post?.author ?? "",
    ...availablePosts.map((item) => item.author),
  ].filter(Boolean)));
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showSeo, setShowSeo] = useState(true);
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(post?.featuredImage ?? null);
  const [tagInput, setTagInput] = useState("");

  // Form state
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [category, setCategory] = useState(post?.category ?? BLOG_CATEGORIES[0]);
  const [tags, setTags] = useState<string[]>(post?.tags ?? []);
  const [author, setAuthor] = useState(post?.author ?? "RailAgents");
  const [status, setStatus] = useState<PostStatus>(post?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(post?.publishedAt ? post.publishedAt.slice(0, 16) : "");
  const [scheduledAt, setScheduledAt] = useState(post?.scheduledAt ? post.scheduledAt.slice(0, 16) : "");
  const [featuredImage, setFeaturedImage] = useState<string | null>(post?.featuredImage ?? null);
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");
  const [focusKeyphrase, setFocusKeyphrase] = useState(post?.focusKeyphrase ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl ?? "");
  const [allowIndexing, setAllowIndexing] = useState(post?.allowIndexing ?? true);
  const [featuredImageAlt, setFeaturedImageAlt] = useState(post?.featuredImageAlt ?? "");
  const [relatedPostIds, setRelatedPostIds] = useState<string[]>(post?.relatedPostIds ?? []);

  // Autosave draft every 30s when content changes
  const draftKey = `railagents_draft_${mode === "edit" ? post?.id : "new"}`;

  const saveDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    const draft = { title, slug, excerpt, content, category, tags, author, featuredImage, featuredImageAlt, seoTitle, metaDescription, focusKeyphrase, canonicalUrl, allowIndexing, relatedPostIds };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setSaveStatus("saved");
  }, [title, slug, excerpt, content, category, tags, author, featuredImage, featuredImageAlt, seoTitle, metaDescription, focusKeyphrase, canonicalUrl, allowIndexing, relatedPostIds, draftKey]);

  useEffect(() => {
    // Keep the save indicator in sync with the current debounced draft.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveStatus("unsaved");
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      saveDraft();
    }, 30_000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [title, slug, excerpt, content, category, tags, author, featuredImage, featuredImageAlt, seoTitle, metaDescription, focusKeyphrase, canonicalUrl, allowIndexing, relatedPostIds, saveDraft]);

  // Load autosaved draft (create mode only)
  /* eslint-disable react-hooks/set-state-in-effect -- restore browser-local draft after mount to preserve hydration. */
  useEffect(() => {
    if (mode === "create" && typeof window !== "undefined") {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try {
          const d = JSON.parse(saved);
          if (d.title) { setTitle(d.title); setSlug(d.slug ?? ""); setSlugManuallyEdited(true); }
          if (d.excerpt) setExcerpt(d.excerpt);
          if (d.content) setContent(d.content);
          if (d.category) setCategory(d.category);
          if (d.tags?.length) setTags(d.tags);
          if (d.author) setAuthor(d.author);
          if (d.featuredImage) { setFeaturedImage(d.featuredImage); setImagePreview(d.featuredImage); }
          if (d.seoTitle) setSeoTitle(d.seoTitle);
          if (d.metaDescription) setMetaDescription(d.metaDescription);
          if (d.focusKeyphrase) setFocusKeyphrase(d.focusKeyphrase);
          if (typeof d.canonicalUrl === "string") setCanonicalUrl(d.canonicalUrl);
          if (typeof d.allowIndexing === "boolean") setAllowIndexing(d.allowIndexing);
          if (d.featuredImageAlt) setFeaturedImageAlt(d.featuredImageAlt);
          if (Array.isArray(d.relatedPostIds)) setRelatedPostIds(d.relatedPostIds);
          setSaveStatus("saved");
        } catch {}
      }
    }
  }, [draftKey, mode]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setFeaturedImage(data.url);
      setImagePreview(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
      e.preventDefault();
      const t = tagInput.trim().replace(/,+$/, "");
      if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags((prev) => prev.filter((t) => t !== tag));

  const buildPayload = () => ({
    title: title.trim(),
    slug: slug.trim(),
    excerpt: excerpt.trim(),
    content,
    featuredImage,
    category,
    tags,
    author: author.trim(),
    seoTitle: seoTitle.trim() || title.trim(),
    metaDescription: metaDescription.trim() || excerpt.trim(),
    canonicalUrl: canonicalUrl.trim() || null,
    focusKeyphrase: focusKeyphrase.trim(),
    allowIndexing,
    featuredImageAlt: featuredImageAlt.trim(),
    relatedPostIds,
    status,
    publishedAt: status === "published" ? (publishedAt ? new Date(publishedAt).toISOString() : null) : null,
    scheduledAt: status === "scheduled" ? (scheduledAt ? new Date(scheduledAt).toISOString() : null) : null,
  });

  const validate = () => {
    if (!title.trim()) return "Title is required.";
    if (!slug.trim()) return "Slug is required.";
    if (!content || content === "<p></p>") return "Content is required.";
    if (!featuredImage) return "Please add a featured image.";
    if (!author.trim()) return "Please select an author.";
    if (status === "scheduled" && !scheduledAt) return "Please set a scheduled publication date.";
    return null;
  };

  const handleSave = async (targetStatus?: PostStatus) => {
    const validErr = validate();
    if (validErr) { setError(validErr); return; }
    setError(null);
    setIsSubmitting(true);

    const payload = { ...buildPayload(), status: targetStatus ?? status };

    try {
      const url = mode === "edit" ? `/api/posts/${post!.id}` : "/api/posts";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");

      // Clear autosave draft on successful save
      if (typeof window !== "undefined") localStorage.removeItem(draftKey);
      setSaveStatus("saved");

      if (mode === "create") router.push(`/admin/posts/${data.id}/edit`);
      else router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveStatusColors: Record<SaveStatus, string> = {
    idle: "text-slate-400",
    saving: "text-amber-500",
    saved: "text-green-600",
    unsaved: "text-slate-400",
  };
  const saveStatusText: Record<SaveStatus, string> = {
    idle: "",
    saving: "Saving...",
    saved: "Saved",
    unsaved: "Unsaved changes",
  };

  return (
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            {mode === "create" ? "Create New Post" : "Edit Post"}
          </h1>
          {saveStatus !== "idle" && (
            <p className={`mt-0.5 text-xs font-semibold ${saveStatusColors[saveStatus]}`}>
              {saveStatusText[saveStatus]}
            </p>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowLivePreview(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Eye size={15} /> Live Preview
          </button>
          <Link
            href="/admin/posts"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => { setSaveStatus("saving"); saveDraft(); }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Save size={15} />
            Save Draft
          </button>
          {post?.status === "published" && (
            <a
              href={`/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Eye size={15} />
              Preview
            </a>
          )}
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
          >
            <Send size={15} />
            {isSubmitting ? "Publishing..." : mode === "edit" && post?.status === "published" ? "Update" : "Publish Now"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 xl:col-span-2">
          {/* Title */}
          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Blog Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                const nextTitle = e.target.value;
                setTitle(nextTitle);
                if (!slugManuallyEdited && mode === "create") setSlug(slugify(nextTitle));
                setSaveStatus("unsaved");
              }}
              placeholder="How to Become an IRCTC Agent in 2025"
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              URL Slug *
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border-2 border-slate-200 bg-white focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10">
              <span className="flex-shrink-0 px-3 text-sm text-slate-400">/blog/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
                placeholder="how-to-become-irctc-agent"
                className="flex-1 py-3 pr-4 text-sm font-mono font-medium text-slate-900 outline-none"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Short Excerpt / Description
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              placeholder="A short summary for the blog listing and SEO description..."
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            />
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-slate-600">
              Article Content *
            </label>
            <RichEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing your blog post here..."
              savedValue={post?.content ?? ""}
            />
          </div>

          {/* SEO Section (collapsible) */}
          <div className="rounded-2xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setShowSeo((v) => !v)}
              className="flex w-full items-center justify-between px-5 py-4 text-sm font-bold text-slate-700"
            >
              <div className="flex items-center gap-2">
                <Globe size={16} />
                SEO & Search Preview
              </div>
              {showSeo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showSeo && (
              <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">SEO Title</label>
                  <input
                    type="text"
                    maxLength={60}
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={title || "SEO optimized title"}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  />
                  <p className="mt-1 text-xs text-slate-400">{(seoTitle || title).length}/60 chars</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    maxLength={160}
                    rows={2}
                    placeholder={excerpt || "Brief description for search engines (150–160 chars)"}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  />
                  <p className="mt-1 text-xs text-slate-400">{(metaDescription || excerpt).length}/160 chars</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Focus Keyphrase</label>
                  <input
                    type="text"
                    value={focusKeyphrase}
                    onChange={(e) => setFocusKeyphrase(e.target.value)}
                    placeholder="e.g. railway ticket cancellation refund"
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-600">Canonical URL</label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder={`https://railagents.in/blog/${slug || "your-post-slug"}`}
                    className="w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                  />
                  <p className="mt-1 text-xs text-slate-400">Leave blank to use this article’s public URL.</p>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="checkbox"
                    checked={allowIndexing}
                    onChange={(e) => setAllowIndexing(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-orange-500"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-800">Search engine visibility</span>
                    <span className="mt-0.5 block text-xs text-slate-500">Allow indexing by default for published posts.</span>
                  </span>
                </label>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Search preview</p>
                  <p className="truncate text-base font-medium text-blue-800">{seoTitle || title || "Your article title"}</p>
                  <p className="mt-0.5 truncate text-xs text-emerald-700">railagents.in/blog/{slug || "your-post-slug"}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{metaDescription || excerpt || "Your article description will appear here."}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-5">
          {/* Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <Clock size={14} /> Publication
            </h3>
            <div className="space-y-3">
              {(["draft", "published", "scheduled"] as PostStatus[]).map((s) => (
                <label key={s} className="flex cursor-pointer items-center gap-3">
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={() => setStatus(s)}
                    className="accent-orange-500"
                  />
                  <span className="text-sm font-semibold capitalize text-slate-700">{s}</span>
                </label>
              ))}

              {status === "published" && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Published date (optional)</label>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              )}
              {status === "scheduled" && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-500">Schedule for *</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
              >
                <Save size={15} />
                Save as Draft
              </button>
              {status === "scheduled" && (
                <button
                  type="button"
                  onClick={() => handleSave("scheduled")}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                >
                  <Calendar size={15} />
                  Schedule Post
                </button>
              )}
              <button
                type="button"
                onClick={() => handleSave("published")}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60"
              >
                <Send size={15} />
                {mode === "edit" && post?.status === "published" ? "Update Post" : "Publish Now"}
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <Upload size={14} /> Featured Image <span className="text-orange-600">*</span>
            </h3>
            {imagePreview ? (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt={featuredImageAlt || title || "Featured"} className="w-full rounded-xl object-cover" style={{ aspectRatio: "16/9" }} />
                <button
                  type="button"
                  onClick={() => { setFeaturedImage(null); setImagePreview(null); }}
                  className="absolute right-2 top-2 rounded-full bg-white p-1 shadow-md hover:bg-red-50"
                >
                  <X size={14} className="text-red-500" />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-8 text-center transition hover:border-orange-300 hover:bg-orange-50">
                <Upload size={20} className="mb-2 text-slate-400" />
                <span className="text-xs font-semibold text-slate-500">
                  {uploadingImage ? "Uploading..." : "Click to upload"}
                </span>
                <span className="mt-0.5 text-[11px] text-slate-400">JPEG, PNG, WebP · Max 5MB</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploadingImage}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </label>
            )}
            <div className="mt-3">
              <input
                type="url"
                placeholder="Or paste image URL..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-700 outline-none focus:border-orange-500"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    setFeaturedImage(e.target.value.trim());
                    setImagePreview(e.target.value.trim());
                    e.target.value = "";
                  }
                }}
              />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Image Alt Text</label>
              <input
                type="text"
                value={featuredImageAlt}
                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                placeholder="Describe the image accurately"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-orange-500"
              />
              <p className="mt-1 text-[11px] text-slate-400">Describe the image for accessibility and search engines.</p>
            </div>
          </div>

          {/* Category & Tags */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">Media & Organization</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Category <span className="text-orange-600">*</span></label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500"
                >
                  {BLOG_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">
                  Tags <span className="font-normal text-slate-400">(press Enter or comma to add)</span>
                </label>
                <div className="flex flex-wrap gap-1.5 rounded-xl border-2 border-slate-200 bg-white p-2.5 focus-within:border-orange-500">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-orange-700">
                      <Tag size={10} />
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 text-orange-400 hover:text-orange-700">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder={tags.length === 0 ? "irctc, railway, agent..." : ""}
                    className="flex-1 min-w-[80px] bg-transparent text-xs font-medium text-slate-700 outline-none placeholder:text-slate-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Author */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-slate-500">
              <User size={14} /> Author
            </h3>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Author <span className="text-orange-600">*</span></label>
            <select
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none focus:border-orange-500"
            >
              <option value="">Select author</option>
              {authorOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>

          {/* Related articles */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-1 text-xs font-extrabold uppercase tracking-wider text-slate-500">Related Posts</h3>
            <p className="mb-3 text-xs text-slate-500">Select relevant existing articles.</p>
            {availablePosts.filter((item) => item.id !== post?.id).length ? (
              <div className="max-h-56 space-y-2 overflow-y-auto">
                {availablePosts.filter((item) => item.id !== post?.id).map((item) => (
                  <label key={item.id} className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={relatedPostIds.includes(item.id)}
                      onChange={(e) => setRelatedPostIds((current) => e.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))}
                      className="mt-0.5 h-4 w-4 accent-orange-500"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold text-slate-700">{item.title}</span>
                      <span className="block truncate text-[10px] text-slate-400">/blog/{item.slug} · {item.status}</span>
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-slate-50 px-3 py-4 text-xs text-slate-500">No other articles are available yet.</p>
            )}
          </div>

          {/* Danger Zone (edit mode only) */}
          {mode === "edit" && post && (
            <div className="rounded-2xl border border-red-100 bg-red-50/50 p-5">
              <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wider text-red-400">Danger Zone</h3>
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Permanently delete this post?")) return;
                  await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
                  router.push("/admin/posts");
                }}
                className="flex items-center gap-2 text-sm font-bold text-red-600 hover:text-red-700"
              >
                <Trash2 size={14} />
                Delete this post
              </button>
            </div>
          )}
        </div>
      </div>
      {showLivePreview && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-3 backdrop-blur-sm sm:p-8" role="dialog" aria-modal="true" aria-label="Article preview">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Live article preview</p>
                <p className="text-xs text-slate-500">Showing the latest editor content after HTML sanitization.</p>
              </div>
              <button type="button" onClick={() => setShowLivePreview(false)} aria-label="Close preview" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={18} /></button>
            </div>
            <article className="mx-auto max-w-3xl p-5 sm:p-10">
              {/* eslint-disable-next-line @next/next/no-img-element -- preview supports arbitrary remote and local draft image URLs. */}
              {imagePreview && <img src={imagePreview} alt={featuredImageAlt || title || "Featured article"} className="mb-7 aspect-[16/9] w-full rounded-2xl object-cover" />}
              <p className="text-xs font-bold uppercase tracking-wider text-orange-700">{category}</p>
              <h1 className="mt-3 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">{title || "Your article title"}</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">{excerpt || "Your article summary will appear here."}</p>
              <div className="mt-8 border-t border-slate-100 pt-6 blog-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(content) }} />
            </article>
          </div>
        </div>
      )}
    </div>
  );
}

