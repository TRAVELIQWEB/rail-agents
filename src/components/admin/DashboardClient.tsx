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
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setConfirmId(null);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("The article could not be deleted. Please try again.");
      }
      router.refresh();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "The article could not be deleted. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-7 p-4 sm:p-6 lg:p-8">
      <section
        aria-labelledby="dashboard-heading"
        className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.14)] sm:px-6 sm:py-5 lg:px-7 lg:py-5"
      >
        <div aria-hidden="true" className="absolute -right-14 -top-20 -z-10 h-72 w-72 rounded-full border-[34px] border-white/[0.04]" />
        <div aria-hidden="true" className="absolute -bottom-24 right-36 -z-10 h-52 w-52 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-orange-300/25 bg-orange-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-300">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" aria-hidden="true" />
              RailAgents · Editorial control room
            </p>
            <h1 id="dashboard-heading" className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Your publishing desk
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-5 text-slate-300 sm:text-sm">
              Keep your articles organized, check what is live, and pick up where you left off.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/posts"
              className="inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 text-xs sm:text-sm font-semibold text-white transition hover:border-white/25 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
            >
              <BookOpen size={16} aria-hidden="true" />
              All articles
            </Link>
            <Link
              href="/admin/posts/new"
              className="inline-flex h-9 sm:h-10 items-center justify-center gap-1.5 rounded-lg bg-orange-500 px-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-950/25 transition hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
            >
              <PenSquare size={16} aria-hidden="true" />
              Create article
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="publishing-status-heading">
        <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">At a glance</p>
            <h2 id="publishing-status-heading" className="mt-1 text-lg font-black tracking-tight text-slate-900">Publishing status</h2>
          </div>
          <p className="text-sm text-slate-500">A quick count of all articles in your workspace.</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total Articles",
            value: stats.totalPosts,
            icon: FileText,
            color: "text-slate-900",
            bg: "bg-slate-100",
            border: "border-slate-200",
            accent: "border-t-slate-400",
            description: "All articles in your workspace",
          },
          {
            label: "Published",
            value: stats.published,
            icon: BookOpen,
            color: "text-emerald-700",
            bg: "bg-emerald-50",
            border: "border-emerald-200/80",
            accent: "border-t-emerald-500",
            description: "Visible on the public blog",
          },
          {
            label: "Drafts",
            value: stats.drafts,
            icon: Edit2,
            color: "text-orange-700",
            bg: "bg-orange-50",
            border: "border-orange-200/80",
            accent: "border-t-orange-500",
            description: "Saved, but not published",
          },
          {
            label: "Scheduled",
            value: stats.scheduled,
            icon: Clock,
            color: "text-blue-700",
            bg: "bg-blue-50",
            border: "border-blue-200/80",
            accent: "border-t-blue-500",
            description: "Set to publish later",
          },
        ].map(({ label, value, icon: Icon, color, bg, border, accent, description }) => (
          <div
            key={label}
            className={`rounded-2xl border border-t-4 ${border} ${accent} bg-white p-4 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5`}
          >
            <div className="flex items-center gap-3">
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${bg} ${color}`}>
                <Icon size={16} aria-hidden="true" />
              </div>
              <p className="text-sm font-semibold text-slate-600">{label}</p>
            </div>
            <p className="mt-4 text-4xl font-black leading-none tracking-tight text-slate-900">{value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
          </div>
        ))}
        </div>
      </section>

      <section aria-labelledby="recent-articles-heading" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-orange-700">Your workspace</p>
            <h2 id="recent-articles-heading" className="mt-1 text-lg font-black tracking-tight text-slate-900">Recently updated</h2>
            <p className="mt-1 text-sm text-slate-500">Your five most recently edited articles.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            >
              Public blog <ExternalLink size={14} aria-hidden="true" />
            </a>
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-700 transition hover:text-orange-800"
            >
              All articles <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {recentPosts.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
              <FileText size={22} aria-hidden="true" />
            </div>
            <p className="mt-4 text-base font-bold text-slate-900">No articles yet</p>
            <p className="mt-1 text-sm text-slate-500">Create your first article to start building the RailAgents blog.</p>
            <Link
              href="/admin/posts/new"
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-orange-600 px-4 text-sm font-bold text-white shadow-xs transition hover:bg-orange-700"
            >
              <PenSquare size={15} aria-hidden="true" />
              Create article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Recently updated articles">
              <thead>
                <tr className="border-b border-slate-200 bg-white text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <th scope="col" className="px-5 py-3.5">Article</th>
                  <th scope="col" className="hidden px-5 py-3.5 sm:table-cell">Category</th>
                  <th scope="col" className="px-5 py-3.5">Status</th>
                  <th scope="col" className="hidden px-5 py-3.5 md:table-cell">Last updated</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="transition-colors odd:bg-white even:bg-slate-50/40 hover:bg-orange-50/50">
                    <td className="max-w-sm px-5 py-3.5">
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
      </section>

      {deleteError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
          {deleteError}
        </p>
      )}

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
