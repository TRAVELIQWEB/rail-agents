"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Save, Send, Eye, Clock, Trash2, ChevronDown, ChevronUp,
  Upload, X, Tag, Globe, User, Calendar, AlertCircle,
  CheckCircle2, RotateCcw, AlertTriangle, ArrowUpRight,
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

  // Autosave draft key
  const draftKey = `railagents_draft_${mode === "edit" ? post?.id : "new"}`;

  const saveDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    const draft = { title, slug, excerpt, content, category, tags, author, featuredImage, featuredImageAlt, seoTitle, metaDescription, focusKeyphrase, canonicalUrl, allowIndexing, relatedPostIds };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setSaveStatus("saved");
  }, [title, slug, excerpt, content, category, tags, author, featuredImage, featuredImageAlt, seoTitle, metaDescription, focusKeyphrase, canonicalUrl, allowIndexing, relatedPostIds, draftKey]);

  // Window beforeunload guard against accidental data loss
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "unsaved") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  useEffect(() => {
    setSaveStatus("unsaved");
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      saveDraft();
    }, 15_000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [title, slug, excerpt, content, category, tags, author, featuredImage, featuredImageAlt, seoTitle, metaDescription, focusKeyphrase, canonicalUrl, allowIndexing, relatedPostIds, saveDraft]);

  // Load autosaved draft (create mode only)
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

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    setError(null);
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

  const validate = (targetStatus?: PostStatus) => {
    const effectiveStatus = targetStatus ?? status;
    if (!title.trim()) return "Article title is required.";
    if (!slug.trim()) return "URL slug is required.";
    if (effectiveStatus !== "draft" && (!content || content === "<p></p>")) {
      return "Article content cannot be empty for publishing.";
    }
    if (effectiveStatus !== "draft" && !featuredImage) {
      return "A featured cover image is required before publishing.";
    }
    if (effectiveStatus !== "draft" && !author.trim()) {
      return "Please select an author for the article.";
    }
    if (effectiveStatus === "scheduled" && !scheduledAt) {
      return "Please set a scheduled publication date & time.";
    }
    return null;
  };

  const handleSave = async (targetStatus?: PostStatus) => {
    const chosenStatus = targetStatus ?? status;
    const validErr = validate(chosenStatus);
    if (validErr) { setError(validErr); setSuccessMessage(null); return; }
    setError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const payload = { ...buildPayload(), status: chosenStatus };

    try {
      const url = mode === "edit" ? `/api/posts/${post!.id}` : "/api/posts";
      const method = mode === "edit" ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save post");

      // Clear local autosave draft on successful server save
      if (typeof window !== "undefined") localStorage.removeItem(draftKey);
      setSaveStatus("saved");
      setStatus(chosenStatus);

      if (mode === "create") {
        router.push(`/admin/posts/${data.id}/edit`);
      } else {
        setSuccessMessage(
          chosenStatus === "published"
            ? "Article published live successfully!"
            : chosenStatus === "scheduled"
            ? "Article scheduled successfully!"
            : "Draft saved successfully!"
        );
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      setSaveStatus("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnpublish = async () => {
    if (!confirm("Unpublish this article and revert it back to a draft? It will no longer be visible on the public website.")) return;
    await handleSave("draft");
  };

  const saveStatusColors: Record<SaveStatus, string> = {
    idle: "text-slate-400",
    saving: "text-amber-600",
    saved: "text-emerald-600",
    unsaved: "text-slate-400",
  };
  const saveStatusText: Record<SaveStatus, string> = {
    idle: "",
    saving: "Saving...",
    saved: "Saved",
    unsaved: "Unsaved changes",
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      {/* Top Notification Banners */}
      {successMessage && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          {status === "published" && (
            <a
              href={`/blog/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
            >
              <span>View Public Post</span>
              <ArrowUpRight size={13} />
            </a>
          )}
        </div>
      )}

      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 shadow-xs">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}
      {/* Top Header Card */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              {mode === "create" ? "Write New Article" : "Edit Article"}
            </h1>
            <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-xs font-bold text-orange-700 border border-orange-200/60">
              {mode === "create" ? "Draft Mode" : post?.status}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span>Compose guides and railway news articles</span>
            {saveStatus !== "idle" && (
              <>
                <span>•</span>
                <span className={`font-semibold ${saveStatusColors[saveStatus]}`}>
                  {saveStatusText[saveStatus]}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/posts"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Back to Posts
          </Link>
          <button
            type="button"
            onClick={() => setShowLivePreview(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50/50 hover:text-orange-700"
          >
            <Eye size={14} /> Preview
          </button>
          <button
            type="button"
            onClick={() => { setSaveStatus("saving"); saveDraft(); }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Save size={14} />
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-orange-600/30 transition hover:bg-orange-700 disabled:opacity-60"
          >
            <Send size={14} />
            {isSubmitting ? "Publishing..." : mode === "edit" && post?.status === "published" ? "Update Article" : "Publish Now"}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main Column */}
        <div className="space-y-6 xl:col-span-2">
          {/* Article Info Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6 space-y-5">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Article Title <span className="text-orange-600">*</span>
                </label>
                <span className="text-[11px] text-slate-400">{title.length} characters</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  setTitle(nextTitle);
                  if (!slugManuallyEdited && mode === "create") setSlug(slugify(nextTitle));
                  setSaveStatus("unsaved");
                }}
                placeholder="e.g. How to Become an Authorized IRCTC Agent: Complete Guide"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Permalink / Slug <span className="text-orange-600">*</span>
              </label>
              <div className="flex items-center overflow-hidden rounded-xl border border-slate-300 bg-white hover:border-orange-300 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/15">
                <span className="flex-shrink-0 bg-slate-50 border-r border-slate-200 px-3.5 py-2.5 text-xs font-semibold text-slate-500">
                  railagents.in/blog/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
                  placeholder="how-to-become-irctc-agent"
                  className="flex-1 px-3 py-2.5 text-xs font-mono font-medium text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                Article Summary / Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="A concise overview of the article for summaries and search cards..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-orange-300 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
              />
            </div>
          </div>

          {/* Article Content / Editor Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs sm:p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Article Content <span className="text-orange-600">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Use the visual editor, or switch to <strong className="text-orange-700">HTML</strong> / <strong className="text-orange-700">Split View</strong> to write and edit raw HTML code directly.
                </p>
              </div>
            </div>
            <RichEditor
              value={content}
              onChange={setContent}
              placeholder="Start writing your article here..."
              savedValue={post?.content ?? ""}
            />
          </div>

          {/* SEO Section (collapsible) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSeo((v) => !v)}
              className="flex w-full items-center justify-between bg-slate-50/70 px-5 py-4 text-xs font-bold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100"
            >
              <div className="flex items-center gap-2">
                <Globe size={15} className="text-orange-600" />
                <span>Search Optimization (SEO & Social Snippet)</span>
              </div>
              {showSeo ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showSeo && (
              <div className="space-y-4 border-t border-slate-100 p-5 sm:p-6">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Custom SEO Title</label>
                    <span className="text-[11px] text-slate-400">{(seoTitle || title).length}/60 chars</span>
                  </div>
                  <input
                    type="text"
                    maxLength={60}
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={title || "SEO optimized title"}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">Meta Description</label>
                    <span className="text-[11px] text-slate-400">{(metaDescription || excerpt).length}/160 chars</span>
                  </div>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    maxLength={160}
                    rows={2}
                    placeholder={excerpt || "Search engine summary snippet..."}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700">Focus Keyphrase</label>
                  <input
                    type="text"
                    value={focusKeyphrase}
                    onChange={(e) => setFocusKeyphrase(e.target.value)}
                    placeholder="e.g. IRCTC agent registration guide"
                    className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/15"
                  />
                </div>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="checkbox"
                    checked={allowIndexing}
                    onChange={(e) => setAllowIndexing(e.target.checked)}
                    className="h-4 w-4 accent-orange-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Index in search engines (Google, Bing)
                  </span>
                </label>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Google SERP Preview</p>
                  <p className="truncate text-sm font-semibold text-blue-700">{seoTitle || title || "Your article title"}</p>
                  <p className="truncate text-[11px] text-emerald-700">https://railagents.in/blog/{slug || "article-slug"}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">{metaDescription || excerpt || "Your article snippet will appear here in search engine result pages."}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          {/* Publication Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <h2 className="mb-3.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Clock size={14} className="text-orange-600" />
              <span>Publishing Status</span>
            </h2>
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(["draft", "published", "scheduled"] as PostStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`rounded-xl py-2 px-1 text-xs font-bold capitalize transition border ${
                    status === s
                      ? "border-orange-500 bg-orange-50 text-orange-700 shadow-xs"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {status === "scheduled" && (
              <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3">
                <label className="mb-1 block text-xs font-bold text-blue-900">Schedule Date & Time *</label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {status === "published" && (
              <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                <label className="mb-1 block text-xs font-bold text-emerald-950">Publication Date (Optional)</label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
              >
                <Save size={14} />
                Save as Draft
              </button>

              {mode === "edit" && post?.status === "published" && (
                <button
                  type="button"
                  onClick={handleUnpublish}
                  disabled={isSubmitting}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-50/80 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60"
                >
                  <RotateCcw size={14} className="text-amber-700" />
                  Unpublish to Draft
                </button>
              )}

              <button
                type="button"
                onClick={() => handleSave(status === "scheduled" ? "scheduled" : "published")}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 py-2.5 text-xs font-bold text-white shadow-sm shadow-orange-600/30 transition hover:bg-orange-700 disabled:opacity-60"
              >
                <Send size={14} />
                {status === "scheduled"
                  ? "Schedule Publication"
                  : mode === "edit" && post?.status === "published"
                  ? "Update Post"
                  : "Publish Live"}
              </button>
            </div>
          </div>

          {/* Featured Image */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <h2 className="mb-3.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-700">
              <span className="flex items-center gap-2">
                <Upload size={14} className="text-orange-600" />
                Featured Image
              </span>
              <span className="text-[11px] font-semibold text-orange-600">* Required</span>
            </h2>

            {imagePreview ? (
              <div className="relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt={featuredImageAlt || title || "Featured"} className="w-full rounded-xl object-cover border border-slate-200" style={{ aspectRatio: "16/9" }} />
                <button
                  type="button"
                  onClick={() => { setFeaturedImage(null); setImagePreview(null); }}
                  className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 shadow-md hover:bg-red-50 text-slate-600 hover:text-red-600 transition"
                  title="Remove image"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/80 py-7 text-center transition hover:border-orange-300 hover:bg-orange-50/50">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-2">
                  <Upload size={18} />
                </div>
                <span className="text-xs font-bold text-slate-700">
                  {uploadingImage ? "Uploading file..." : "Upload Cover Image"}
                </span>
                <span className="mt-0.5 text-[11px] text-slate-400">JPG, PNG, WebP up to 5MB</span>
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
                placeholder="Or paste external image URL..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-500"
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    setFeaturedImage(e.target.value.trim());
                    setImagePreview(e.target.value.trim());
                    e.target.value = "";
                  }
                }}
              />
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-xs font-semibold text-slate-600">Alt text (SEO & Accessibility)</label>
              <input
                type="text"
                value={featuredImageAlt}
                onChange={(e) => setFeaturedImageAlt(e.target.value)}
                placeholder="Describe image content..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Categorization & Author */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Taxonomy & Author
            </h2>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Category <span className="text-orange-600">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500"
              >
                {BLOG_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Author <span className="text-orange-600">*</span></label>
              <select
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500"
              >
                <option value="">Select author</option>
                {authorOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                Tags <span className="font-normal text-slate-400">(press Enter to add)</span>
              </label>
              <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-300 bg-white p-2 focus-within:border-orange-500">
                {tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-800">
                    <Tag size={10} />
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 text-orange-500 hover:text-orange-800">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={addTag}
                  placeholder={tags.length === 0 ? "e.g. irctc, booking..." : ""}
                  className="flex-1 min-w-[70px] bg-transparent text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
                />
              </div>
            </div>
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

