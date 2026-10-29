"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Save, Send, Eye, Clock, Trash2, ChevronDown, ChevronUp,
  Upload, X, Tag, Globe, User, Calendar, AlertCircle,
  CheckCircle2, RotateCcw, AlertTriangle, ArrowUpRight, ArrowRight, Video,
  Plus, Key, Sparkles, Share2,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaYoutube } from "react-icons/fa6";
import { BLOG_CATEGORIES } from "@/types/blog";
import type { BlogPost, PostStatus } from "@/types/blog";
import { sanitizeHtml } from "@/lib/sanitize";
import { extractYouTubeId, parseSocialVideoUrl } from "@/lib/youtube-parser";
import { InteractiveButton } from "@/components/ui/InteractiveButton";

// Dynamically import the editor (Tiptap is client-only)
const RichEditor = dynamic(
  () => import("./RichEditor").then((m) => m.RichEditor),
  { ssr: false, loading: () => <div className="w-full flex-1 min-h-[380px] bg-slate-50/70 animate-pulse" /> }
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
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedSuccessData, setPublishedSuccessData] = useState<{
    title: string;
    slug: string;
    status: PostStatus;
    id: string;
  } | null>(null);
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
  const [featuredVideoUrl, setFeaturedVideoUrl] = useState<string>(post?.featuredVideoUrl ?? "");
  const [coverMediaType, setCoverMediaType] = useState<"image" | "video">(
    post?.featuredVideoUrl ? "video" : "image"
  );
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription ?? "");
  const [focusKeyphrase, setFocusKeyphrase] = useState(post?.focusKeyphrase ?? "");
  const [keyphraseInput, setKeyphraseInput] = useState("");
  const [showAllKeyphrases, setShowAllKeyphrases] = useState(false);
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl ?? "");
  const [allowIndexing, setAllowIndexing] = useState(post?.allowIndexing ?? true);
  const [featuredImageAlt, setFeaturedImageAlt] = useState(post?.featuredImageAlt ?? "");
  const [relatedPostIds, setRelatedPostIds] = useState<string[]>(post?.relatedPostIds ?? []);
  const [instagramUrl, setInstagramUrl] = useState<string>(post?.socialLinks?.instagram ?? "");
  const [facebookUrl, setFacebookUrl] = useState<string>(post?.socialLinks?.facebook ?? "");
  const [youtubeSocialUrl, setYoutubeSocialUrl] = useState<string>(post?.socialLinks?.youtube ?? "");

  // Autosave draft key
  const draftKey = `railagents_draft_${mode === "edit" ? post?.id : "new"}`;

  const saveDraft = useCallback(() => {
    if (typeof window === "undefined") return;
    const draft = { title, slug, excerpt, content, category, tags, author, featuredImage, featuredVideoUrl, featuredImageAlt, seoTitle, metaDescription, focusKeyphrase, canonicalUrl, allowIndexing, relatedPostIds, instagramUrl, facebookUrl, youtubeSocialUrl };
    localStorage.setItem(draftKey, JSON.stringify(draft));
    setSaveStatus("saved");
  }, [title, slug, excerpt, content, category, tags, author, featuredImage, featuredVideoUrl, featuredImageAlt, seoTitle, metaDescription, focusKeyphrase, canonicalUrl, allowIndexing, relatedPostIds, instagramUrl, facebookUrl, youtubeSocialUrl, draftKey]);

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

  const isDraftLoadedRef = useRef(false);

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
          if (d.featuredVideoUrl) { setFeaturedVideoUrl(d.featuredVideoUrl); setCoverMediaType("video"); }
          if (d.seoTitle) setSeoTitle(d.seoTitle);
          if (d.metaDescription) setMetaDescription(d.metaDescription);
          if (d.focusKeyphrase) setFocusKeyphrase(d.focusKeyphrase);
          if (typeof d.canonicalUrl === "string") setCanonicalUrl(d.canonicalUrl);
          if (typeof d.allowIndexing === "boolean") setAllowIndexing(d.allowIndexing);
          if (d.featuredImageAlt) setFeaturedImageAlt(d.featuredImageAlt);
          if (Array.isArray(d.relatedPostIds)) setRelatedPostIds(d.relatedPostIds);
          if (typeof d.instagramUrl === "string") setInstagramUrl(d.instagramUrl);
          if (typeof d.facebookUrl === "string") setFacebookUrl(d.facebookUrl);
          if (typeof d.youtubeSocialUrl === "string") setYoutubeSocialUrl(d.youtubeSocialUrl);
          setSaveStatus("saved");
        } catch {}
      }
    }
    isDraftLoadedRef.current = true;
  }, [draftKey, mode]);

  useEffect(() => {
    // Avoid autosaving empty initial state before draft has had a chance to restore
    if (!isDraftLoadedRef.current && mode === "create") return;
    setSaveStatus("unsaved");
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      setSaveStatus("saving");
      saveDraft();
    }, 15_000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [title, slug, excerpt, content, category, tags, author, featuredImage, featuredVideoUrl, featuredImageAlt, seoTitle, metaDescription, focusKeyphrase, canonicalUrl, allowIndexing, relatedPostIds, instagramUrl, facebookUrl, youtubeSocialUrl, saveDraft, mode]);

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

  // Multi-selector keyphrases (LinkedIn / job portal style chip selector)
  const currentKeyphrases = focusKeyphrase
    ? focusKeyphrase.split(",").map((k) => k.trim()).filter(Boolean)
    : [];

  const addKeyphrase = (phrase: string) => {
    const cleaned = phrase.trim().replace(/^,+|,+$/g, "");
    if (!cleaned) return;
    const exists = currentKeyphrases.some((k) => k.toLowerCase() === cleaned.toLowerCase());
    if (!exists) {
      const updated = [...currentKeyphrases, cleaned];
      setFocusKeyphrase(updated.join(", "));
    }
    setKeyphraseInput("");
  };

  const removeKeyphrase = (phraseToRemove: string) => {
    const updated = currentKeyphrases.filter(
      (k) => k.toLowerCase() !== phraseToRemove.toLowerCase()
    );
    setFocusKeyphrase(updated.join(", "));
  };

  const SUGGESTED_KEYPHRASES = [
    "IRCTC Agent Registration",
    "Tatkal Booking Rules",
    "Train Ticket Commission",
    "Authorized Rail Agent",
    "Ticket Cancellation OTP",
    "Railway Travel Business",
    "IRCTC Principal Service Provider",
    "ERS Printout Rules",
    "AC Tatkal Opening Timings",
    "Sleeper Tatkal Rules",
    "IRCTC Agent Login Portal",
    "TDR Refund Guidelines",
    "Sub-Agent ID Activation",
    "Agent Monthly Income",
    "Vande Bharat Booking Rules",
    "IRCTC DSC Token Setup",
    "Tatkal Software Ban Rules",
    "Ticket Booking Limits",
  ];

  const buildPayload = () => ({
    title: title.trim(),
    slug: slug.trim(),
    excerpt: excerpt.trim(),
    content,
    featuredImage,
    featuredVideoUrl: featuredVideoUrl.trim() || null,
    socialLinks: {
      instagram: instagramUrl.trim() || null,
      facebook: facebookUrl.trim() || null,
      youtube: youtubeSocialUrl.trim() || null,
    },
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

  // Validate all starmark / mandatory fields
  const validateMandatoryFields = (): string | null => {
    if (!title.trim()) return "Article Title is required.";
    if (!slug.trim()) return "Permalink / Slug is required.";
    if (!content || content.trim() === "" || content === "<p></p>") {
      return "Article Content Body is required.";
    }
    const hasCoverImage = Boolean(featuredImage && featuredImage.trim());
    const hasCoverVideo = Boolean(featuredVideoUrl && featuredVideoUrl.trim());
    if (!hasCoverImage && !hasCoverVideo) {
      return "Featured Cover (Cover Image or YouTube Video URL) is required.";
    }
    if (!category || !category.trim()) {
      return "Category is required.";
    }
    if (!author || !author.trim()) {
      return "Author is required.";
    }
    return null;
  };

  const validate = (targetStatus?: PostStatus) => {
    const effectiveStatus = targetStatus ?? status;
    const mandatoryErr = validateMandatoryFields();
    if (mandatoryErr) return mandatoryErr;

    if (effectiveStatus === "scheduled" && !scheduledAt) {
      return "Please set a scheduled publication date & time.";
    }
    return null;
  };

  const handleNextStep = () => {
    const err = validateMandatoryFields();
    if (err) {
      setError(err);
      setSuccessMessage(null);
      return;
    }
    setError(null);
    setShowPublishModal(true);
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
      setShowPublishModal(false);

      // Show rich modal on publish or update
      setPublishedSuccessData({
        title: payload.title,
        slug: payload.slug,
        status: chosenStatus,
        id: data.id ?? post?.id ?? "",
      });

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

  // Live word count & reading time for the editor header
  const wordCount = content
    .replace(/<[^>]*>/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  const saveStatusColors: Record<SaveStatus, string> = {
    idle: "text-slate-400",
    saving: "text-amber-500",
    saved: "text-emerald-500",
    unsaved: "text-slate-400",
  };
  const saveStatusText: Record<SaveStatus, string> = {
    idle: "",
    saving: "Saving...",
    saved: "Saved",
    unsaved: "Unsaved changes",
  };

  return (
    <div className="w-full px-4 py-5 sm:px-6 lg:px-8 max-w-none">
      {/* Top Notification Banners */}
      {successMessage && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-xs">
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
        <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 shadow-xs">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-slate-500 font-medium">
        <ol className="flex items-center gap-1.5">
          <li>
            <Link href="/admin/dashboard" className="hover:text-orange-600 transition">Admin</Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">/</li>
          <li>
            <Link href="/admin/posts" className="hover:text-orange-600 transition">Posts</Link>
          </li>
          <li aria-hidden="true" className="text-slate-300">/</li>
          <li className="text-slate-800 font-bold" aria-current="page">
            {mode === "create" ? "Create Article" : "Edit Article"}
          </li>
        </ol>
      </nav>

      {/* Top Header Card */}
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              {mode === "create" ? "Create Article" : "Edit Article"}
            </h1>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase border ${
              status === "published"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : status === "scheduled"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-orange-50 text-orange-700 border-orange-200/60"
            }`}>
              {mode === "create" ? "Draft" : status}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
            <span>Unified editorial publishing desk</span>
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
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowLivePreview(true)}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
          >
            <Eye size={13} className="text-slate-500" />
            <span>Preview</span>
          </button>
          <Link
            href="/admin/posts"
            className="inline-flex h-9 items-center rounded-xl border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Back to Posts
          </Link>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Editor & Right Settings Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(340px,390px)] gap-6 items-stretch">
        {/* Main Column */}
        <div className="flex flex-col space-y-6 min-w-0">
          {/* Box 1: Article Basic Details Card */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-4 flex-shrink-0 transition hover:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 font-bold border border-orange-100">
                  <Sparkles size={15} />
                </span>
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Article Details &amp; Slug
                  </h2>
                  <p className="text-[11px] text-slate-400 font-normal">Core headline, permalink URL, and article summary</p>
                </div>
              </div>
              <span className="text-[10.5px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/70 uppercase tracking-wider">
                Required *
              </span>
            </div>

            {/* Title & Slug in a clean stacked layout with comfortable 42px input height */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Article Title <span className="text-orange-600">*</span>
                </label>
                <span className="text-[10.5px] font-semibold text-slate-400">{title.length} characters</span>
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
                placeholder="Enter a clear, compelling article headline..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:font-normal placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Permalink / Slug <span className="text-orange-600">*</span>
              </label>
              <div className="flex h-10 items-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50/50 hover:border-slate-300 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition">
                <span className="flex h-full items-center flex-shrink-0 bg-slate-100/90 border-r border-slate-200 px-3 text-xs font-semibold text-slate-500">
                  railagents.in/blog/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugManuallyEdited(true); }}
                  placeholder="article-permalink-slug"
                  className="flex-1 h-full px-3 text-xs font-mono font-semibold text-slate-900 outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Article Summary / Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="Brief 1–2 sentence summary for blog cards and key takeaway box..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {/* Box 2: Article Content / Editor Card */}
          <div className="flex-1 flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition hover:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-3.5 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 font-bold border border-orange-100">
                  <CheckCircle2 size={15} />
                </span>
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Article Content Body <span className="text-orange-600">*</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 font-normal">Write or paste formatted content, headings, lists, and images</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                  {wordCount} {wordCount === 1 ? "word" : "words"} · ~{readingTime} min read
                </span>
              </div>
            </div>
            <div className="flex-1 flex flex-col min-h-0 bg-white">
              <RichEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your article here..."
                savedValue={post?.content ?? ""}
                onUploadImage={async (file: File) => {
                  const fd = new FormData();
                  fd.append("file", file);
                  const res = await fetch("/api/upload", { method: "POST", body: fd });
                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error ?? "Upload failed");
                  return data.url;
                }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Column: Distinct boxed cards for settings */}
        <div className="flex flex-col space-y-6 min-w-0">

          {/* Box 3: Featured Media (Cover Image or YouTube Video) */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 transition hover:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                  {coverMediaType === "video" ? <Video size={15} className="text-red-600" /> : <Upload size={15} />}
                </span>
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Featured Cover
                  </h2>
                  <p className="text-[11px] text-slate-400 font-normal">16:9 image or YouTube video</p>
                </div>
              </div>
              <span className="text-[10.5px] font-bold text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200/70">Required *</span>
            </div>

            {/* Media Type Switcher Tabs */}
            <div className="flex rounded-xl bg-slate-100/90 p-1 border border-slate-200/70">
              <button
                type="button"
                onClick={() => setCoverMediaType("image")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                  coverMediaType === "image"
                    ? "bg-orange-600 text-white shadow-sm ring-1 ring-orange-700/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Upload size={13} className={coverMediaType === "image" ? "text-white" : "text-slate-500"} />
                Cover Image
              </button>
              <button
                type="button"
                onClick={() => setCoverMediaType("video")}
                className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                  coverMediaType === "video"
                    ? "bg-orange-600 text-white shadow-sm ring-1 ring-orange-700/20"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Video size={13} className={coverMediaType === "video" ? "text-white" : "text-slate-500"} />
                YouTube Video
              </button>
            </div>

            {coverMediaType === "video" ? (
              /* YouTube Video Option */
              <div className="space-y-3.5 pt-0.5">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    YouTube Video URL <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={featuredVideoUrl}
                      onChange={(e) => setFeaturedVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... or /shorts/..."
                      className="h-10 flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition"
                    />
                    {featuredVideoUrl && (
                      <button
                        type="button"
                        onClick={() => setFeaturedVideoUrl("")}
                        className="h-10 rounded-xl border border-slate-200 px-2.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-red-600 cursor-pointer"
                        title="Clear link"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive YouTube Preview Box */}
                {(() => {
                  const videoId = extractYouTubeId(featuredVideoUrl);

                  if (videoId) {
                    return (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10.5px] font-bold text-slate-600">
                          <span>Live Video Preview</span>
                          <span className="text-emerald-600 flex items-center gap-1 font-mono text-[10px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            ID: {videoId}
                          </span>
                        </div>
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-md">
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
                            title="YouTube video preview"
                            className="h-full w-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-5 px-3 text-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-600 mb-1.5 border border-orange-100">
                        <Video size={15} />
                      </div>
                      <p className="text-xs font-bold text-slate-800">No YouTube Video Added</p>
                      <p className="mt-0.5 text-[10.5px] text-slate-400 leading-tight">
                        Paste any YouTube watch or Shorts link above.
                      </p>
                    </div>
                  );
                })()}

                {/* Custom 16:9 Cover Image for YouTube Shorts / Video */}
                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10.5px] font-bold uppercase tracking-wider text-slate-700">
                      Custom 16:9 Cover Image (For YouTube Shorts)
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => { setFeaturedImage(null); setImagePreview(null); }}
                        className="text-[10.5px] font-bold text-red-600 hover:underline cursor-pointer"
                      >
                        Remove Cover
                      </button>
                    )}
                  </div>
                  {imagePreview ? (
                    <div className="relative overflow-hidden rounded-xl border border-slate-200 aspect-[16/9]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imagePreview} alt="Custom 16:9 video cover" className="h-full w-full object-cover" />
                      <div className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-0.5 text-[9.5px] font-bold text-white">
                        16:9 Blog Card Cover Active
                      </div>
                    </div>
                  ) : (
                    <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-3 text-center transition hover:border-orange-400 hover:bg-orange-50/40">
                      <Upload size={13} className="text-orange-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-700">
                        {uploadingImage ? "Uploading..." : "Upload 16:9 Cover Image for Shorts"}
                      </span>
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
                </div>
              </div>
            ) : (
              /* Featured Image Option */
              <div className="space-y-3 pt-0.5">
                {imagePreview ? (
                  <div className="relative group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt={featuredImageAlt || title || "Featured"} className="w-full rounded-xl object-cover border border-slate-200" style={{ aspectRatio: "16/9" }} />
                    <button
                      type="button"
                      onClick={() => { setFeaturedImage(null); setImagePreview(null); }}
                      className="absolute right-2 top-2 rounded-full bg-white/95 p-1.5 shadow-md hover:bg-red-50 text-slate-600 hover:text-red-600 transition cursor-pointer"
                      title="Remove image"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-5 text-center transition hover:border-orange-400 hover:bg-orange-50/30">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-50 text-orange-600 mb-1.5 border border-orange-100">
                      <Upload size={15} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">
                      {uploadingImage ? "Uploading file..." : "Upload Cover Image"}
                    </span>
                    <span className="mt-0.5 text-[10px] text-slate-400">JPG, PNG, WebP up to 5MB (16:9 recommended)</span>
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

                <div>
                  <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-slate-600">
                    Or Paste Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-800 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition"
                    onBlur={(e) => {
                      if (e.target.value.trim()) {
                        setFeaturedImage(e.target.value.trim());
                        setImagePreview(e.target.value.trim());
                        e.target.value = "";
                      }
                    }}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10.5px] font-bold uppercase tracking-wider text-slate-600">
                    Image Alt Text (SEO &amp; Accessibility)
                  </label>
                  <input
                    type="text"
                    value={featuredImageAlt}
                    onChange={(e) => setFeaturedImageAlt(e.target.value)}
                    placeholder="Brief description of the cover image..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs text-slate-800 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Box 4: Categorization & Author */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-4 transition hover:border-slate-300">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                  <Tag size={15} />
                </span>
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Taxonomy &amp; Author
                  </h2>
                  <p className="text-[11px] text-slate-400 font-normal">Category, author, and topic tags</p>
                </div>
              </div>
              <span className="text-[10.5px] font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">Organization</span>
            </div>

            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3.5">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Category <span className="text-orange-600">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
                  >
                    {BLOG_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Author <span className="text-orange-600">*</span>
                  </label>
                  <select
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition cursor-pointer"
                  >
                    <option value="">Select author</option>
                    {authorOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                  Tags <span className="font-normal text-slate-400 normal-case">(press Enter to add)</span>
                </label>
                <div className="min-h-[40px] flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 p-2 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition">
                  {tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 rounded-lg bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-800 border border-orange-200/70">
                      <Tag size={9} className="text-orange-500" />
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-0.5 text-orange-400 hover:text-orange-800 cursor-pointer">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder={tags.length === 0 ? "Type tag and press Enter..." : "Add tag..."}
                    className="flex-1 min-w-[90px] bg-transparent py-0.5 px-1 text-xs font-medium text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Box 5: Related Articles */}
          <div className="flex-1 flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3 transition hover:border-slate-300">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                    <Sparkles size={15} />
                  </span>
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                      Related Posts
                    </h3>
                    <p className="text-[11px] text-slate-400 font-normal">Recommend existing articles</p>
                  </div>
                </div>
                <span className="text-[10.5px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">Optional</span>
              </div>

              <div className="mt-3">
                {availablePosts.filter((item) => item.id !== post?.id).length ? (
                  <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                    {availablePosts.filter((item) => item.id !== post?.id).map((item) => (
                      <label key={item.id} className="flex cursor-pointer items-start gap-2.5 rounded-xl p-2.5 transition hover:bg-orange-50/40 border border-slate-100 hover:border-orange-200">
                        <input
                          type="checkbox"
                          checked={relatedPostIds.includes(item.id)}
                          onChange={(e) => setRelatedPostIds((current) => e.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))}
                          className="mt-0.5 h-4 w-4 accent-orange-600 rounded"
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-bold text-slate-800">{item.title}</span>
                          <span className="block truncate text-[10.5px] text-slate-400">/blog/{item.slug} · {item.status}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-slate-50 border border-slate-200/60 px-3.5 py-3 text-xs text-slate-500">No other articles are available yet.</p>
                )}
              </div>
            </div>

            {mode === "edit" && post && (
              <div className="pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm("Are you sure you want to permanently delete this post?")) return;
                    await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
                    router.push("/admin/posts");
                  }}
                  className="w-full h-10 flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-100/70 text-red-700 text-xs font-bold transition-all cursor-pointer"
                >
                  <Trash2 size={13} className="text-red-500" />
                  <span>Delete This Article</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Box 7: Search Optimization (SEO & Social Snippet) Section */}
      <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition hover:border-slate-300">
        {/* Card Header */}
        <button
          type="button"
          onClick={() => setShowSeo((v) => !v)}
          className="flex w-full items-center justify-between border-b border-slate-100 bg-white px-5 py-4 text-left transition hover:bg-slate-50/60 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
              <Globe size={16} />
            </span>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Search Optimization (SEO, Meta &amp; Keyphrases)
              </h2>
              <p className="text-[11px] font-normal text-slate-400">
                Configure search engine snippet, target keywords, and Google indexing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="rounded-full bg-orange-50 border border-orange-200/70 px-2.5 py-0.5 text-[10.5px] font-bold text-orange-700">
              {currentKeyphrases.length} {currentKeyphrases.length === 1 ? "keyphrase" : "keyphrases"}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
              {showSeo ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </span>
          </div>
        </button>

        {showSeo && (
          <div className="p-5 sm:p-6 space-y-5 bg-white">
            {/* Row 1: 50/50 Side-by-Side Custom SEO Title & Meta Description (Equal Height, Zero Empty Space) */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* Custom SEO Title */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Custom SEO Title
                  </label>
                  <span className={`text-[10.5px] font-semibold ${(seoTitle || title).length > 55 ? "text-amber-600" : "text-slate-400"}`}>
                    {(seoTitle || title).length} / 60 chars
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={60}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "Enter SEO title for Google search results..."}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-semibold text-slate-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                    Meta Description
                  </label>
                  <span className={`text-[10.5px] font-semibold ${(metaDescription || excerpt).length > 150 ? "text-amber-600" : "text-slate-400"}`}>
                    {(metaDescription || excerpt).length} / 160 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  maxLength={160}
                  placeholder={excerpt || "Write a compelling summary for search engine results..."}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 text-xs font-medium text-slate-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition placeholder:font-normal placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Row 2: Focus Keyphrases & Suggested Keyphrases */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-800">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-orange-50 text-orange-600 border border-orange-100">
                    <Key size={11} />
                  </span>
                  <span>Focus Keyphrases</span>
                  <span className="text-[11px] font-normal text-slate-400 normal-case">
                    (Type custom keyword &amp; press Enter, or click suggestions below)
                  </span>
                </label>
                <span className="text-[11px] font-bold text-slate-500">
                  {currentKeyphrases.length} selected
                </span>
              </div>

              {/* Multi-Select Pills Container */}
              <div className="min-h-[42px] flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/50 p-2 transition focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100">
                {currentKeyphrases.map((phrase) => (
                  <span
                    key={phrase}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-900 shadow-2xs"
                  >
                    <Sparkles size={10} className="text-orange-500 shrink-0" />
                    <span>{phrase}</span>
                    <button
                      type="button"
                      onClick={() => removeKeyphrase(phrase)}
                      className="rounded-full p-0.5 text-orange-400 hover:bg-orange-200/60 hover:text-orange-900 transition-colors cursor-pointer"
                      title="Remove keyphrase"
                      aria-label={`Remove ${phrase}`}
                    >
                      <X size={11} />
                    </button>
                  </span>
                ))}

                {/* Inline Type-to-Add Input */}
                <div className="flex flex-1 items-center min-w-[180px] px-1">
                  <input
                    type="text"
                    value={keyphraseInput}
                    onChange={(e) => setKeyphraseInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addKeyphrase(keyphraseInput);
                      }
                      if (e.key === "Backspace" && !keyphraseInput && currentKeyphrases.length > 0) {
                        removeKeyphrase(currentKeyphrases[currentKeyphrases.length - 1]);
                      }
                    }}
                    placeholder={currentKeyphrases.length === 0 ? "Type a focus keyphrase and press Enter..." : "Add another keyphrase..."}
                    className="w-full bg-transparent text-xs font-semibold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400"
                  />
                  {keyphraseInput.trim() && (
                    <button
                      type="button"
                      onClick={() => addKeyphrase(keyphraseInput)}
                      className="ml-1.5 inline-flex items-center gap-1 rounded-lg bg-orange-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-orange-700 cursor-pointer shrink-0"
                    >
                      <Plus size={11} />
                      Add
                    </button>
                  )}
                </div>
              </div>

              {/* Suggested Railway Keyphrases */}
              {(() => {
                const unselected = SUGGESTED_KEYPHRASES.filter(
                  (suggestion) => !currentKeyphrases.some((k) => k.toLowerCase() === suggestion.toLowerCase())
                );
                const displayed = showAllKeyphrases ? unselected : unselected.slice(0, 6);

                if (unselected.length === 0) return null;

                return (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
                        Suggested Railway Keyphrases (Click to add)
                      </p>
                      {unselected.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setShowAllKeyphrases((prev) => !prev)}
                          className="text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer transition-colors"
                        >
                          {showAllKeyphrases ? "Show less" : `Show all (${unselected.length})`}
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      {displayed.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => addKeyphrase(suggestion)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-all cursor-pointer"
                        >
                          <Plus size={11} className="text-orange-500 shrink-0" />
                          <span>{suggestion}</span>
                        </button>
                      ))}

                      {!showAllKeyphrases && unselected.length > 6 && (
                        <button
                          type="button"
                          onClick={() => setShowAllKeyphrases(true)}
                          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-orange-300 bg-orange-50/70 px-2.5 py-1 text-xs font-bold text-orange-700 hover:bg-orange-100 transition-colors cursor-pointer"
                        >
                          <span>+{unselected.length - 6} more</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Row 3: Equal-Height Bottom Grid — Indexing Control (4 cols) + Google SERP Preview (8 cols) */}
            <div className="grid gap-4 lg:grid-cols-12 items-stretch">
              {/* Left 4 Cols: Search Engine Indexing Card */}
              <label className="lg:col-span-4 flex flex-col justify-between cursor-pointer rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 transition hover:border-orange-300 hover:bg-orange-50/20">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    <Globe size={11} className="text-orange-600" />
                    <span>Search Visibility</span>
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${allowIndexing ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-200 text-slate-600"}`}>
                    {allowIndexing ? "Indexed" : "Noindex"}
                  </span>
                </div>

                <div className="mt-3 flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={allowIndexing}
                    onChange={(e) => setAllowIndexing(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-orange-600 rounded cursor-pointer shrink-0"
                  />
                  <div>
                    <span className="block text-xs font-bold text-slate-900">
                      Index in search engines (Google, Bing)
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-500">
                      Allow search engines to crawl and display this article in public search results.
                    </span>
                  </div>
                </div>
              </label>

              {/* Right 8 Cols: Live Google SERP Preview Card */}
              <div className="lg:col-span-8 flex flex-col justify-between rounded-xl border border-slate-200/90 bg-slate-50/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                    <Sparkles size={11} className="text-orange-600" />
                    <span>Google SERP Preview</span>
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-slate-200/80">
                    Live Snippet
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200/80 bg-white px-3.5 py-2.5 shadow-2xs">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-100 text-[9px] font-black text-orange-700 shrink-0">
                      R
                    </span>
                    <span className="font-bold text-slate-800">RailAgents</span>
                    <span className="text-slate-300">•</span>
                    <span className="truncate text-[10.5px] text-emerald-700">
                      https://railagents.in/blog/{slug || "article-slug"}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs sm:text-[13px] font-bold text-[#1a0dab]">
                    {seoTitle || title || "Your article title"}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-600">
                    {metaDescription || excerpt || "Your article snippet will appear here in search engine result pages."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Box 8: Social Media Post / Reel Links (Instagram, Facebook, YouTube) */}
      <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs transition hover:border-slate-300">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
              <Share2 size={15} />
            </span>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                Social Media Video &amp; Post Links
              </h2>
              <p className="text-[11px] text-slate-400">
                Attach related Instagram Reel, Facebook Video, or YouTube links for this article (Displayed on the blog post)
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto text-[10.5px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
            Optional
          </span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {/* Instagram Reel / Post URL */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white">
                <FaInstagram className="h-2.5 w-2.5" />
              </span>
              <span>Instagram Reel / Post URL</span>
            </label>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition"
              />
              {instagramUrl && (
                <button
                  type="button"
                  onClick={() => setInstagramUrl("")}
                  className="h-10 rounded-xl border border-slate-200 px-2.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-red-600 cursor-pointer"
                  title="Clear Instagram link"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Facebook Video / Reel URL */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-[#1877f2] text-white">
                <FaFacebookF className="h-2.5 w-2.5" />
              </span>
              <span>Facebook Video / Reel URL</span>
            </label>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                placeholder="https://www.facebook.com/reel/... or fb.watch/..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition"
              />
              {facebookUrl && (
                <button
                  type="button"
                  onClick={() => setFacebookUrl("")}
                  className="h-10 rounded-xl border border-slate-200 px-2.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-red-600 cursor-pointer"
                  title="Clear Facebook link"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Additional YouTube / Shorts Link */}
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-700">
              <span className="flex h-4 w-4 items-center justify-center rounded bg-[#ff0000] text-white">
                <FaYoutube className="h-2.5 w-2.5" />
              </span>
              <span>YouTube Video / Short URL</span>
            </label>
            <div className="flex gap-1.5">
              <input
                type="url"
                value={youtubeSocialUrl}
                onChange={(e) => setYoutubeSocialUrl(e.target.value)}
                placeholder="https://www.youtube.com/shorts/..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-900 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-100 transition"
              />
              {youtubeSocialUrl && (
                <button
                  type="button"
                  onClick={() => setYoutubeSocialUrl("")}
                  className="h-10 rounded-xl border border-slate-200 px-2.5 text-xs text-slate-400 hover:bg-slate-100 hover:text-red-600 cursor-pointer"
                  title="Clear YouTube link"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Submit Navigation Bar */}
      <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-2.5 text-xs text-slate-500">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 font-bold border border-emerald-200 shrink-0">✓</span>
          <span>Ready with all details? Click <strong className="text-slate-800 font-bold">Next</strong> to select Draft, Publish, or Schedule options.</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {/* Nearby Alert for Missing Required Fields */}
          {error && (
            <div className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 animate-in fade-in duration-150">
              <AlertCircle size={14} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowLivePreview(true)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
          >
            Preview Article
          </button>

          <InteractiveButton
            as="button"
            type="button"
            onClick={handleNextStep}
            disabled={isSubmitting}
            label="Next"
            icon={<ArrowRight size={14} className="text-white" />}
            size="sm"
            variant="orange"
          />
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

      {/* Success Modal */}
      {publishedSuccessData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl sm:p-8 border border-slate-100">
            {/* Header badge / icon */}
            <div className="flex items-center justify-between">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/50">
                <CheckCircle2 size={32} />
              </div>
              <button
                type="button"
                onClick={() => setPublishedSuccessData(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="Close success dialog"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {publishedSuccessData.status === "published"
                  ? "Article Live on Website"
                  : publishedSuccessData.status === "scheduled"
                  ? "Article Scheduled"
                  : "Draft Saved"}
              </span>

              <h3 className="mt-3 text-xl font-black text-slate-900 sm:text-2xl leading-snug">
                {publishedSuccessData.status === "published"
                  ? "Blog Published Successfully!"
                  : "Changes Saved Successfully!"}
              </h3>

              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                Your post <strong className="text-slate-900 font-bold">&ldquo;{publishedSuccessData.title}&rdquo;</strong> has been saved and synchronized across all readers.
              </p>
            </div>

            {/* URL Box */}
            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Public URL</p>
              <p className="mt-1 font-mono text-xs text-orange-600 truncate font-semibold">
                https://railagents.in/blog/{publishedSuccessData.slug}
              </p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  setPublishedSuccessData(null);
                  router.push("/admin/posts");
                }}
                className="flex-1 rounded-xl border border-slate-200 py-3 text-xs font-extrabold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-center"
              >
                Go to All Posts
              </button>
              {publishedSuccessData.status === "published" && (
                <Link
                  href={`/blog/${publishedSuccessData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 py-3 text-xs font-extrabold text-white shadow-md shadow-orange-500/20 hover:bg-orange-700 transition-colors cursor-pointer text-center"
                >
                  <span>View Public Post</span>
                  <ArrowUpRight size={15} />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Publish Options Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <Send size={18} />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {mode === "edit" ? "Update Article" : "Ready to Publish?"}
                  </h3>
                  <p className="text-xs text-slate-500">Choose how you want to save this blog</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Status Selection Pills */}
            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Choose Status
              </label>
              <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80">
                {(["draft", "published", "scheduled"] as PostStatus[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`rounded-xl py-2 px-2 text-xs font-bold capitalize transition-all cursor-pointer ${
                      status === s
                        ? "bg-orange-600 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Scheduled Date Picker */}
            {status === "scheduled" && (
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5">
                <label className="mb-1.5 block text-xs font-bold text-blue-900">
                  Select Scheduled Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>
            )}

            {/* Published Date (Optional) */}
            {status === "published" && (
              <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5">
                <label className="mb-1.5 block text-xs font-bold text-emerald-950">
                  Custom Publication Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-emerald-800/80">
                  Leave empty to publish with current timestamp.
                </p>
              </div>
            )}

            {/* Draft notice */}
            {status === "draft" && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
                This post will be saved as a private draft and will not be visible on the public website.
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-6 flex flex-col gap-2.5">
              <div className="flex justify-center">
                <InteractiveButton
                  as="button"
                  type="button"
                  onClick={() => handleSave(status)}
                  disabled={isSubmitting}
                  label={
                    isSubmitting
                      ? "Saving..."
                      : status === "published"
                      ? mode === "edit"
                        ? "Update & Publish"
                        : "Confirm & Publish"
                      : status === "scheduled"
                      ? "Schedule Post"
                      : "Save as Draft"
                  }
                  icon={<Send size={14} className="text-white" />}
                  size="md"
                  variant="orange"
                  className="w-full max-w-full"
                />
              </div>

              {mode === "edit" && post?.status === "published" && (
                <button
                  type="button"
                  onClick={async () => {
                    await handleUnpublish();
                    setShowPublishModal(false);
                  }}
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50/80 py-2.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100 disabled:opacity-60 cursor-pointer"
                >
                  <RotateCcw size={14} className="text-amber-700" />
                  Unpublish to Draft
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="w-full rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

