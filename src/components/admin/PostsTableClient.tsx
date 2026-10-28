"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenSquare, Search, Eye, Edit2, Trash2, Filter, Calendar, Sparkles, X, Check } from "lucide-react";
import type { BlogPost, PostStatus } from "@/types/blog";
import { InteractiveButton } from "@/components/ui/InteractiveButton";

const STATUS_TABS: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Published", value: "published" },
  { label: "Drafts", value: "draft" },
  { label: "Scheduled", value: "scheduled" },
];

const STATUS_BADGE: Record<PostStatus, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-slate-100 text-slate-600",
  scheduled: "bg-blue-100 text-blue-700",
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
    // format as YYYY-MM-DDTHH:mm
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
    <div className="p-6 sm:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">All Posts</h1>
          <p className="mt-0.5 text-sm text-slate-500">{posts.length} post{posts.length !== 1 ? "s" : ""} total</p>
        </div>
        <InteractiveButton
          as="link"
          href="/admin/posts/new"
          label="New Post"
          icon={<PenSquare size={15} className="text-white" />}
          size="sm"
          variant="orange"
        />
      </div>

      {/* Filters: Search, Status Tabs, and Category Dropdown */}
      <div className="mb-5 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, author, category or slug..."
            className="h-8.5 w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tab pills */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-0.5 shadow-2xs" role="tablist" aria-label="Filter by publication status">
            {STATUS_TABS.map(({ label, value }) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={tab === value}
                onClick={() => setTab(value)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                  tab === value
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {label}
                <span className={`ml-1.5 rounded-full px-1.5 py-0.2 text-[9.5px] font-black ${tab === value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {value === "all" ? posts.length : posts.filter((p) => p.status === value).length}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table & Mobile Responsive View */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 sm:p-16 text-center">
          <Filter size={28} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">
            {search ? "No posts match your search query." : "No posts found for the selected filter."}
          </p>
          <Link href="/admin/posts/new" className="mt-3 inline-block text-xs font-bold text-orange-600 hover:underline">
            Create a new article →
          </Link>
        </div>
      ) : (
        <>
          {/* Mobile Card List (Hidden on sm and larger) */}
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filtered.map((post) => (
              <div key={post.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {post.category}
                    </span>
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="mt-1 block font-bold text-slate-900 line-clamp-2 hover:text-orange-600"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-400 truncate">
                      /blog/{post.slug}
                    </p>
                  </div>
                  <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${STATUS_BADGE[post.status]}`}>
                    {post.status}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                  <span>{post.publishedAt ? formatDate(post.publishedAt) : "Draft"}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openDateModal(post)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-orange-50 hover:text-orange-600"
                      title="Change publish date"
                    >
                      <Calendar size={13} />
                    </button>
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </Link>
                    {post.status === "published" && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
                        title="View live post"
                      >
                        <Eye size={13} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setConfirmId(post.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop & Tablet Table (Hidden on small mobile) */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left text-xs" aria-label="Blog posts directory">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th scope="col" className="px-5 py-3.5">Title &amp; Permalink</th>
                  <th scope="col" className="px-5 py-3.5">Category</th>
                  <th scope="col" className="hidden md:table-cell px-5 py-3.5">Author</th>
                  <th scope="col" className="px-5 py-3.5">Status</th>
                  <th scope="col" className="hidden md:table-cell px-5 py-3.5">Publish Date</th>
                  <th scope="col" className="hidden lg:table-cell px-5 py-3.5">Last Updated</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((post) => (
                  <tr key={post.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 max-w-xs">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="font-bold text-slate-900 line-clamp-1 hover:text-orange-600 transition"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-0.5 font-mono text-[11px] text-slate-400 truncate">
                        /blog/{post.slug}
                      </p>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                        {post.category}
                      </span>
                    </td>

                    <td className="hidden md:table-cell px-5 py-3.5 text-slate-600 font-medium">
                      {post.author}
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold capitalize ${STATUS_BADGE[post.status] || "bg-slate-100 text-slate-700"}`}>
                        {post.status}
                      </span>
                    </td>

                    <td className="hidden md:table-cell px-5 py-3.5 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium">
                          {post.publishedAt ? formatDate(post.publishedAt) : <span className="text-slate-400 italic">Not set</span>}
                        </span>
                        <button
                          type="button"
                          onClick={() => openDateModal(post)}
                          className="rounded p-1 text-slate-400 hover:bg-orange-50 hover:text-orange-600 transition cursor-pointer"
                          title="Change Publish Date"
                          aria-label={`Change publish date for ${post.title}`}
                        >
                          <Calendar size={13} />
                        </button>
                      </div>
                    </td>

                    <td className="hidden lg:table-cell px-5 py-3.5 text-slate-400 font-medium">
                      {formatDate(post.updatedAt)}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openDateModal(post)}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-orange-50 hover:text-orange-600 md:hidden cursor-pointer"
                          title="Change Date"
                          aria-label={`Change date for ${post.title}`}
                        >
                          <Calendar size={14} />
                        </button>

                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
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
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
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
                              ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          }`}
                          title={post.status === "published" ? "Unpublish to draft" : "Publish live"}
                        >
                          {post.status === "published" ? "Unpublish" : "Publish"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmId(post.id)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 cursor-pointer"
                          title="Delete article"
                          disabled={deleting === post.id}
                          aria-label={`Delete ${post.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Delete Confirm Dialog */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Delete this post?</h3>
            <p className="mt-1.5 text-sm text-slate-500">This action is permanent and cannot be undone.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setConfirmId(null)} className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmId)}
                disabled={!!deleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Publication Date Modal */}
      {editingDatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                  <Calendar size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Change Publication Date</h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-[240px]">{editingDatePost.title}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDatePost(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Select New Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={newPublishDate}
                  onChange={(e) => setNewPublishDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={setDateToNow}
                  className="inline-flex items-center gap-1 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700 hover:bg-orange-100 transition cursor-pointer"
                >
                  <Sparkles size={12} />
                  <span>Set to Now (Bring to Top)</span>
                </button>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-900 leading-relaxed">
                💡 <strong>Pro Tip:</strong> Changing this date to today&apos;s date will make this older blog appear at the very top of your public blog listing and homepage as your newest article.
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setEditingDatePost(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdatePublishDate}
                disabled={updatingDate}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-orange-600/30 hover:bg-orange-700 transition disabled:opacity-60 cursor-pointer"
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

