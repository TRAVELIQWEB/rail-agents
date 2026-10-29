"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PenSquare,
  Search,
  Eye,
  Edit2,
  Trash2,
  Filter,
  Calendar,
  Sparkles,
  X,
  Video,
  Image as ImageIcon,
  FileText,
} from "lucide-react";
import type { BlogPost, PostStatus } from "@/types/blog";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
];

const STATUS_BADGE: Record<PostStatus, string> = {
  published: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
  draft: "bg-[#222731] text-zinc-300 border border-[#2e3440]",
  scheduled: "bg-blue-500/10 text-blue-400 border border-blue-500/25",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function PostsTableClient({ posts }: { posts: BlogPost[] }) {
  const router = useRouter();
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingDatePost, setEditingDatePost] = useState<BlogPost | null>(null);
  const [newPublishDate, setNewPublishDate] = useState("");
  const [updatingDate, setUpdatingDate] = useState(false);

  const openDateModal = (post: BlogPost) => {
    setEditingDatePost(post);
    const existingDate = post.publishedAt || post.createdAt;
    setNewPublishDate(existingDate ? new Date(existingDate).toISOString().slice(0, 16) : "");
  };

  const handleUpdatePublishDate = async () => {
    if (!editingDatePost) return;
    setUpdatingDate(true);
    try {
      const isoDate = newPublishDate ? new Date(newPublishDate).toISOString() : new Date().toISOString();
      await fetch(`/api/posts/${editingDatePost.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishedAt: isoDate }),
      });
      setEditingDatePost(null);
      router.refresh();
    } catch (err) {
      console.error("Failed to update publish date:", err);
    } finally {
      setUpdatingDate(false);
    }
  };

  const setDateToNow = () => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
    setNewPublishDate(localISOTime);
  };

  const filtered = useMemo(() => {
    let list = tab === "all" ? posts : posts.filter((p) => p.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q)
      );
    }
    return list;
  }, [posts, tab, search]);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setConfirmId(null);
    try {
      await fetch(`/api/posts/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setDeleting(null);
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const newStatus: PostStatus = post.status === "published" ? "draft" : "published";
    await fetch(`/api/posts/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Matte Header Card */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#242933] bg-[#161920] p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-orange-400">
            <FileText size={12} />
            <span>Article Repository</span>
          </div>
          <h1 className="mt-1 text-xl font-black tracking-tight text-zinc-100 sm:text-2xl">
            All Blog Posts
          </h1>
          <p className="mt-0.5 text-xs text-zinc-400">
            Showing <strong className="text-zinc-200">{filtered.length}</strong> of{" "}
            <strong className="text-zinc-200">{posts.length}</strong> total articles
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#ea580c] px-4 text-xs sm:text-sm font-bold text-white transition hover:bg-[#f97316]"
        >
          <PenSquare size={15} />
          <span>Create New Post</span>
        </Link>
      </div>

      {/* Filters: Search & Status Tabs */}
      <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, category or slug..."
            className="h-10 w-full rounded-xl border border-[#262b35] bg-[#14171c] pl-9 pr-9 text-xs text-zinc-100 outline-none transition placeholder:text-zinc-500 hover:border-[#343b48] focus:border-[#ea580c]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-200 cursor-pointer"
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Status Tab pills */}
        <div
          className="flex items-center gap-1 rounded-xl border border-[#242933] bg-[#14171c] p-1"
          role="tablist"
          aria-label="Filter by publication status"
        >
          {STATUS_TABS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                tab === value
                  ? "bg-[#ea580c] text-white"
                  : "text-zinc-400 hover:bg-[#1f242d] hover:text-zinc-100"
              }`}
            >
              {label}
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[9.5px] font-black ${
                  tab === value ? "bg-white/20 text-white" : "bg-[#1f242d] text-zinc-400"
                }`}
              >
                {value === "all" ? posts.length : posts.filter((p) => p.status === value).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table & Mobile Responsive View */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#282e3a] bg-[#161920] p-12 sm:p-16 text-center">
          <Filter size={28} className="mx-auto mb-3 text-zinc-500" />
          <p className="text-sm font-semibold text-zinc-300">
            {search ? "No posts match your search query." : "No posts found for the selected filter."}
          </p>
          <Link href="/admin/posts/new" className="mt-3 inline-block text-xs font-bold text-orange-400 hover:underline">
            Create a new article →
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Card List (Hidden on sm and larger) */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filtered.map((post) => (
              <div key={post.id} className="rounded-2xl border border-[#242933] bg-[#161920] p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="rounded-md bg-[#1f242d] border border-[#2c323e] px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                      {post.category}
                    </span>
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="mt-1.5 block font-bold text-zinc-100 line-clamp-2 hover:text-orange-400"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-[10px] text-zinc-500 truncate">
                      /blog/{post.slug}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_BADGE[post.status]}`}>
                    {post.status}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-[#222630] pt-2.5 text-[11px] text-zinc-400">
                  <span>{post.publishedAt ? formatDate(post.publishedAt) : "Draft"}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openDateModal(post)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#222731] hover:text-orange-400"
                      title="Change publish date"
                    >
                      <Calendar size={13} />
                    </button>
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#222731] hover:text-white"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </Link>
                    {post.status === "published" && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#222731] hover:text-white"
                        title="View live post"
                      >
                        <Eye size={13} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmId(post.id)}
                      className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-950/40 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-[#242933] bg-[#161920]">
            <table className="w-full text-left text-xs" aria-label="Blog posts directory">
              <thead>
                <tr className="border-b border-[#242933] bg-[#14171c] text-zinc-400 text-[10.5px] font-bold uppercase tracking-wider">
                  <th scope="col" className="px-5 py-3.5">Title &amp; Permalink</th>
                  <th scope="col" className="px-5 py-3.5">Media</th>
                  <th scope="col" className="px-5 py-3.5">Category</th>
                  <th scope="col" className="hidden md:table-cell px-5 py-3.5">Author</th>
                  <th scope="col" className="px-5 py-3.5">Status</th>
                  <th scope="col" className="hidden md:table-cell px-5 py-3.5">Publish Date</th>
                  <th scope="col" className="hidden lg:table-cell px-5 py-3.5">Updated</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222630]">
                {filtered.map((post) => {
                  const hasVideo = Boolean(post.featuredVideoUrl);
                  const hasCover = Boolean(post.featuredImage);
                  return (
                    <tr key={post.id} className="transition-colors hover:bg-[#1c2029]">
                      <td className="px-5 py-3.5 max-w-xs">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="font-bold text-zinc-100 line-clamp-1 hover:text-orange-400 transition"
                        >
                          {post.title}
                        </Link>
                        <p className="mt-0.5 font-mono text-[11px] text-zinc-500 truncate">
                          /blog/{post.slug}
                        </p>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          {hasVideo ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-red-500/25 bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400">
                              <Video size={11} />
                              <span>Video</span>
                            </span>
                          ) : hasCover ? (
                            <span className="inline-flex items-center gap-1 rounded-md border border-[#2c323e] bg-[#1f242d] px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                              <ImageIcon size={11} className="text-orange-400" />
                              <span>16:9</span>
                            </span>
                          ) : (
                            <span className="text-[10.5px] text-zinc-500">—</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="rounded-lg bg-[#1f242d] border border-[#2c323e] px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                          {post.category}
                        </span>
                      </td>

                      <td className="hidden md:table-cell px-5 py-3.5 text-zinc-300 font-medium">
                        {post.author}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold capitalize ${STATUS_BADGE[post.status] || "bg-[#222731] text-zinc-300"}`}>
                          {post.status}
                        </span>
                      </td>

                      <td className="hidden md:table-cell px-5 py-3.5 text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium">
                            {post.publishedAt ? formatDate(post.publishedAt) : <span className="text-zinc-500 italic">Not set</span>}
                          </span>
                          <button
                            type="button"
                            onClick={() => openDateModal(post)}
                            className="rounded-md p-1 text-zinc-400 hover:bg-[#222731] hover:text-orange-400 transition cursor-pointer"
                            title="Change Publish Date"
                            aria-label={`Change publish date for ${post.title}`}
                          >
                            <Calendar size={13} />
                          </button>
                        </div>
                      </td>

                      <td className="hidden lg:table-cell px-5 py-3.5 text-zinc-400 font-medium">
                        {formatDate(post.updatedAt)}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openDateModal(post)}
                            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-[#222731] hover:text-orange-400 md:hidden cursor-pointer"
                            title="Change Date"
                            aria-label={`Change date for ${post.title}`}
                          >
                            <Calendar size={14} />
                          </button>

                          <Link
                            href={`/admin/posts/${post.id}/edit`}
                            className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-[#222731] hover:text-zinc-100"
                            title="Edit article"
                            aria-label={`Edit ${post.title}`}
                          >
                            <Edit2 size={14} />
                          </Link>

                          {post.status === "published" && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg p-1.5 text-zinc-400 transition hover:bg-[#222731] hover:text-zinc-100"
                              title="View public post"
                              aria-label={`View ${post.title} publicly`}
                            >
                              <Eye size={14} />
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => togglePublish(post)}
                            className={`rounded-lg px-2.5 py-1 text-[10.5px] font-bold transition cursor-pointer ${
                              post.status === "published"
                                ? "bg-[#222731] text-zinc-300 border border-[#2e3440] hover:bg-[#2a303c]"
                                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20"
                            }`}
                            title={post.status === "published" ? "Unpublish to draft" : "Publish live"}
                          >
                            {post.status === "published" ? "Unpublish" : "Publish"}
                          </button>

                          <button
                            type="button"
                            onClick={() => setConfirmId(post.id)}
                            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-red-950/40 hover:text-red-400 cursor-pointer"
                            title="Delete article"
                            disabled={deleting === post.id}
                            aria-label={`Delete ${post.title}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Delete Confirm Dialog */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#262b35] bg-[#161920] p-6 shadow-2xl">
            <h3 className="text-base font-black text-zinc-100">Delete this post?</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              This action is permanent and cannot be undone.
            </p>
            <div className="mt-5 flex gap-2.5">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 rounded-xl border border-[#2c323e] bg-[#1f242d] py-2 text-xs font-bold text-zinc-200 transition hover:bg-[#282e3a] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={!!deleting}
                className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-bold text-white transition hover:bg-red-500 disabled:opacity-60 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Publication Date Modal */}
      {editingDatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-[#161920] p-6 shadow-2xl border border-[#262b35] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#242933] pb-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/25">
                  <Calendar size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">Change Publication Date</h3>
                  <p className="text-[11px] text-zinc-400 truncate max-w-[240px]">{editingDatePost.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDatePost(null)}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#222731] hover:text-white cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                  Select New Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={newPublishDate}
                  onChange={(e) => setNewPublishDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-[#282d37] bg-[#111318] px-3.5 text-xs font-semibold text-zinc-100 outline-none focus:border-[#ea580c]"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={setDateToNow}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/25 bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/20 transition cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>Set to Now (Bring to Top)</span>
                </button>
              </div>

              <div className="rounded-xl border border-[#242933] bg-[#111318] p-3 text-xs text-zinc-400 leading-relaxed">
                <strong className="text-orange-400">Tip:</strong> Updating this date to today moves this article to the top of your public blog listing.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingDatePost(null)}
                className="rounded-xl border border-[#2c323e] bg-[#1f242d] px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-[#282e3a] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdatePublishDate}
                disabled={updatingDate}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#ea580c] px-5 py-2 text-xs font-bold text-white hover:bg-[#f97316] transition disabled:opacity-60 cursor-pointer"
              >
                {updatingDate ? "Updating..." : "Update Date"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
