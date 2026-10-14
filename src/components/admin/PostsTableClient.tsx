"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenSquare, Search, Eye, Edit2, Trash2, Filter } from "lucide-react";
import type { BlogPost, PostStatus } from "@/types/blog";

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
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
        >
          <PenSquare size={16} />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm text-slate-800 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
          />
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {STATUS_TABS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setTab(value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                tab === value
                  ? "bg-orange-500 text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {label}
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${tab === value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {value === "all" ? posts.length : posts.filter((p) => p.status === value).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
          <Filter size={28} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">
            {search ? "No posts match your search." : "No posts in this category."}
          </p>
          <Link href="/admin/posts/new" className="mt-3 inline-block text-sm font-bold text-orange-600 hover:underline">
            Create your first post →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-left">
                <th className="px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">Title</th>
                <th className="hidden px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 sm:table-cell">Category</th>
                <th className="hidden px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 md:table-cell">Author</th>
                <th className="px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">Status</th>
                <th className="hidden px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-500 lg:table-cell">Updated</th>
                <th className="px-5 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((post) => (
                <tr key={post.id} className="transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="max-w-xs font-semibold text-slate-900 line-clamp-1">{post.title}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">/blog/{post.slug}</p>
                  </td>
                  <td className="hidden px-5 py-4 text-xs font-medium text-slate-500 sm:table-cell">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1">{post.category}</span>
                  </td>
                  <td className="hidden px-5 py-4 text-xs text-slate-500 md:table-cell">{post.author}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${STATUS_BADGE[post.status]}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="hidden px-5 py-4 text-xs text-slate-400 lg:table-cell">{formatDate(post.updatedAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </Link>
                      {post.status === "published" && (
                        <a
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          title="View public"
                        >
                          <Eye size={14} />
                        </a>
                      )}
                      <button
                        onClick={() => togglePublish(post)}
                        className={`rounded-lg px-2 py-1 text-[11px] font-bold transition ${
                          post.status === "published"
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                        title={post.status === "published" ? "Unpublish" : "Publish"}
                      >
                        {post.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => setConfirmId(post.id)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                        disabled={deleting === post.id}
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
    </div>
  );
}

