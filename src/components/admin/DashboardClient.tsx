"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenSquare, FileText, BookOpen, Clock, Eye, Trash2, Edit2 } from "lucide-react";
import type { BlogPost } from "@/types/blog";
import { useState } from "react";

interface Stats {
  totalPosts: number;
  published: number;
  drafts: number;
  scheduled: number;
}

interface Props {
  stats: Stats;
  recentPosts: BlogPost[];
}

const STATUS_BADGE: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-slate-100 text-slate-600",
  scheduled: "bg-blue-100 text-blue-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function DashboardClient({ stats, recentPosts }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

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

  return (
    <div className="p-6 sm:p-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-500">Overview of your RailAgents content</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.98]"
        >
          <PenSquare size={16} />
          New Post
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Posts", value: stats.totalPosts, icon: FileText, color: "text-slate-600", bg: "bg-slate-100" },
          { label: "Published", value: stats.published, icon: BookOpen, color: "text-green-600", bg: "bg-green-100" },
          { label: "Drafts", value: stats.drafts, icon: Edit2, color: "text-slate-500", bg: "bg-slate-100" },
          { label: "Scheduled", value: stats.scheduled, icon: Clock, color: "text-blue-600", bg: "bg-blue-100" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-black text-slate-900">{value}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-slate-500">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-bold text-orange-700 transition hover:bg-orange-100"
          >
            <PenSquare size={16} />
            Create New Blog Post
          </Link>
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <FileText size={16} />
            Manage All Posts
          </Link>
          <a
            href="/blog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Eye size={16} />
            View Public Blog
          </a>
        </div>
      </div>

      {/* Recent Posts */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">Recently Updated</h2>
          <Link href="/admin/posts" className="text-xs font-bold text-orange-600 hover:underline">
            View All →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <FileText size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">No posts yet.</p>
            <Link href="/admin/posts/new" className="mt-3 inline-block text-sm font-bold text-orange-600 hover:underline">
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">Title</th>
                  <th className="hidden px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-500 sm:table-cell">Category</th>
                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="hidden px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-500 md:table-cell">Updated</th>
                  <th className="px-5 py-3 text-xs font-extrabold uppercase tracking-wider text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900 line-clamp-1">{post.title}</p>
                      <p className="mt-0.5 text-xs text-slate-400">/blog/{post.slug}</p>
                    </td>
                    <td className="hidden px-5 py-4 text-xs text-slate-500 sm:table-cell">{post.category}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${STATUS_BADGE[post.status]}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="hidden px-5 py-4 text-xs text-slate-500 md:table-cell">{formatDate(post.updatedAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </Link>
                        {post.status === "published" && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                            title="View"
                          >
                            <Eye size={15} />
                          </a>
                        )}
                        <button
                          onClick={() => setConfirmId(post.id)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                          disabled={deleting === post.id}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-base font-black text-slate-900">Delete this post?</h3>
            <p className="mt-1.5 text-sm text-slate-500">This action cannot be undone. The post will be permanently removed.</p>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
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

