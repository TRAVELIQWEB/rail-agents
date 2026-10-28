"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenSquare, FileText, BookOpen, Clock, Eye, Trash2, Edit2, ArrowRight, ExternalLink } from "lucide-react";
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
  published: "bg-emerald-50 text-emerald-700 border border-emerald-200/80",
  draft: "bg-slate-100 text-slate-700 border border-slate-200",
  scheduled: "bg-blue-50 text-blue-700 border border-blue-200/80",
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Editorial Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Publishing Overview
            </h1>
            <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10.5px] font-extrabold text-orange-700 border border-orange-200/80 uppercase tracking-wider">
              Live CMS
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Manage RailAgents articles, track drafts, and view recently updated guides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-[0.98] cursor-pointer"
          >
            <BookOpen size={14} className="text-slate-500" />
            <span>Manage Posts</span>
          </Link>
          <Link
            href="/admin/posts/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm shadow-orange-500/25 transition hover:bg-orange-700 active:scale-[0.98] cursor-pointer"
          >
            <PenSquare size={14} />
            <span>Create Article</span>
          </Link>
        </div>
      </div>

      {/* Clean 4-Column Metric Cards */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
        {[
          {
            label: "Total Articles",
            value: stats.totalPosts,
            icon: FileText,
            color: "text-slate-900",
            bg: "bg-slate-100",
            border: "border-slate-200",
            badge: "Database",
          },
          {
            label: "Published Live",
            value: stats.published,
            icon: BookOpen,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
            border: "border-emerald-200/80",
            badge: "Public",
          },
          {
            label: "Draft Articles",
            value: stats.drafts,
            icon: Edit2,
            color: "text-orange-700",
            bg: "bg-orange-50",
            border: "border-orange-200/80",
            badge: "In Progress",
          },
          {
            label: "Scheduled",
            value: stats.scheduled,
            icon: Clock,
            color: "text-blue-700",
            bg: "bg-blue-50",
            border: "border-blue-200/80",
            badge: "Upcoming",
          },
        ].map(({ label, value, icon: Icon, color, bg, border, badge }) => (
          <div
            key={label}
            className={`rounded-2xl border ${border} bg-white p-4 sm:p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${bg} ${color}`}>
                <Icon size={16} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {badge}
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">{value}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick Action Navigation Chips */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Shortcuts:</span>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/posts/new"
                className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200/80 bg-orange-50/70 px-3 py-1.5 text-xs font-bold text-orange-800 transition hover:bg-orange-100 cursor-pointer"
              >
                <PenSquare size={13} className="text-orange-600" />
                <span>Write New Guide</span>
              </Link>
              <Link
                href="/admin/posts"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
              >
                <FileText size={13} className="text-slate-500" />
                <span>Filter All Posts</span>
              </Link>
              <a
                href="/blog"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
              >
                <ExternalLink size={13} className="text-slate-400" />
                <span>Open Public Blog</span>
              </a>
            </div>
          </div>

          <Link
            href="/admin/posts"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 transition"
          >
            <span>View all articles ({stats.totalPosts})</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Recently Updated Articles Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-black text-slate-900 tracking-tight">Recently Modified Articles</h2>
            <p className="text-xs text-slate-500">Latest 5 posts modified in the editorial workspace</p>
          </div>
          <Link
            href="/admin/posts"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 transition"
          >
            See Full Table →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="p-12 text-center">
            <FileText size={32} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No articles found in the database</p>
            <p className="mt-1 text-xs text-slate-400">Get started by authoring your first railway guide or news post.</p>
            <Link
              href="/admin/posts/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-orange-700"
            >
              <PenSquare size={14} />
              <span>Create Article</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Recently updated articles">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th scope="col" className="px-5 py-3">Article Title &amp; URL</th>
                  <th scope="col" className="hidden sm:table-cell px-5 py-3">Category</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="hidden md:table-cell px-5 py-3">Last Updated</th>
                  <th scope="col" className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 max-w-sm">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="font-bold text-slate-900 hover:text-orange-600 line-clamp-1 transition"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-0.5 text-[11px] font-mono text-slate-400 truncate">
                        /blog/{post.slug}
                      </p>
                    </td>

                    <td className="hidden sm:table-cell px-5 py-3.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {post.category}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold capitalize ${STATUS_BADGE[post.status] || "bg-slate-100 text-slate-700"}`}>
                        {post.status}
                      </span>
                    </td>

                    <td className="hidden md:table-cell px-5 py-3.5 text-slate-500 font-medium">
                      {formatDate(post.updatedAt)}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
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
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                            title="View live post"
                            aria-label={`View ${post.title} on live blog`}
                          >
                            <Eye size={14} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setConfirmId(post.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
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
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-slate-900">Delete this article?</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              This action is permanent and cannot be undone. The article and its associated data will be removed.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmId)}
                disabled={!!deleting}
                className="flex-1 rounded-xl bg-red-600 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

