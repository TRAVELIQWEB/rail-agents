"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PenSquare,
  FileText,
  BookOpen,
  Clock,
  Eye,
  Trash2,
  Edit2,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  TrendingUp,
} from "lucide-react";
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
  published: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
  draft: "bg-[#222731] text-zinc-300 border border-[#2e3440]",
  scheduled: "bg-blue-500/10 text-blue-400 border border-blue-500/25",
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

  const publishedRate = stats.totalPosts > 0 ? Math.round((stats.published / stats.totalPosts) * 100) : 0;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Top Matte Executive Banner */}
      <section
        aria-labelledby="dashboard-heading"
        className="relative overflow-hidden rounded-2xl border border-[#242933] bg-[#161920] p-5 sm:px-7 sm:py-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/25 bg-orange-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-orange-400">
              <Sparkles size={12} className="text-orange-400" />
              <span>RailAgents · Editorial Control Room</span>
            </div>
            <h1 id="dashboard-heading" className="mt-2.5 text-2xl font-black tracking-tight text-zinc-100 sm:text-3xl">
              Your Publishing Desk
            </h1>
            <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400 sm:text-sm">
              Manage railway guides, IRCTC updates, and passenger advisories from one unified workspace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#2a303c] bg-[#1d222b] px-4 text-xs font-bold text-zinc-200 transition hover:border-[#384050] hover:bg-[#252b36] hover:text-white"
            >
              <ExternalLink size={14} aria-hidden="true" />
              <span>Live Blog</span>
            </a>
            <Link
              href="/admin/posts"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#2a303c] bg-[#1d222b] px-4 text-xs font-bold text-zinc-200 transition hover:border-[#384050] hover:bg-[#252b36] hover:text-white"
            >
              <BookOpen size={14} aria-hidden="true" />
              <span>All Articles</span>
            </Link>
            <Link
              href="/admin/posts/new"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#ea580c] px-4 text-xs font-bold text-white transition hover:bg-[#f97316]"
            >
              <PenSquare size={14} aria-hidden="true" />
              <span>Create Article</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Matte KPI Stat Cards */}
      <section aria-labelledby="publishing-status-heading">
        <div className="mb-3.5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-orange-400">Overview</p>
            <h2 id="publishing-status-heading" className="mt-0.5 text-base font-extrabold tracking-tight text-zinc-100">
              Publishing Metrics
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <TrendingUp size={13} className="text-emerald-400" />
            <span>Publication ratio: <strong className="text-zinc-200">{publishedRate}% live</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Total Articles",
              value: stats.totalPosts,
              icon: FileText,
              iconColor: "text-zinc-200",
              iconBg: "bg-[#222731] border-[#2e3440]",
              badge: "Workspace Total",
              badgeColor: "text-zinc-400 bg-[#1d222b]",
              description: "All articles stored in database",
            },
            {
              label: "Published Live",
              value: stats.published,
              icon: CheckCircle2,
              iconColor: "text-emerald-400",
              iconBg: "bg-emerald-500/10 border-emerald-500/20",
              badge: "Public",
              badgeColor: "text-emerald-400 bg-emerald-500/10",
              description: "Indexed and visible to readers",
            },
            {
              label: "Drafts in Progress",
              value: stats.drafts,
              icon: Edit2,
              iconColor: "text-orange-400",
              iconBg: "bg-orange-500/10 border-orange-500/20",
              badge: "Private",
              badgeColor: "text-orange-400 bg-orange-500/10",
              description: "Saved privately in editor",
            },
            {
              label: "Scheduled Queue",
              value: stats.scheduled,
              icon: Clock,
              iconColor: "text-blue-400",
              iconBg: "bg-blue-500/10 border-blue-500/20",
              badge: "Upcoming",
              badgeColor: "text-blue-400 bg-blue-500/10",
              description: "Queued for auto-publication",
            },
          ].map(({ label, value, icon: Icon, iconColor, iconBg, badge, badgeColor, description }) => (
            <div
              key={label}
              className="flex flex-col justify-between rounded-2xl border border-[#242933] bg-[#161920] p-5 transition hover:border-[#323946]"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl border ${iconBg} ${iconColor}`}>
                  <Icon size={17} aria-hidden="true" />
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${badgeColor}`}>
                  {badge}
                </span>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-black leading-none tracking-tight text-zinc-100">{value}</p>
                <p className="mt-1.5 text-xs font-bold text-zinc-300">{label}</p>
                <p className="mt-0.5 text-[11px] text-zinc-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recently Updated Articles Table */}
      <section aria-labelledby="recent-articles-heading" className="overflow-hidden rounded-2xl border border-[#242933] bg-[#161920]">
        <div className="flex flex-col gap-3 border-b border-[#242933] bg-[#14171c] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 id="recent-articles-heading" className="text-base font-extrabold tracking-tight text-zinc-100">
              Recently Updated Articles
            </h2>
            <p className="mt-0.5 text-xs text-zinc-400">
              Quickly jump back into your five most recently modified posts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 transition hover:text-orange-300"
            >
              <span>View all articles</span>
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {recentPosts.length === 0 ? (
          <div className="px-5 py-12 text-center sm:px-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <FileText size={22} aria-hidden="true" />
            </div>
            <p className="mt-4 text-base font-bold text-zinc-100">No articles yet</p>
            <p className="mt-1 text-xs text-zinc-400">Create your first article to start building the RailAgents blog.</p>
            <Link
              href="/admin/posts/new"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#ea580c] px-4 text-xs font-bold text-white transition hover:bg-[#f97316]"
            >
              <PenSquare size={14} aria-hidden="true" />
              Create article
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" aria-label="Recently updated articles">
              <thead>
                <tr className="border-b border-[#242933] bg-[#14171c]/60 text-left text-[10.5px] font-bold uppercase tracking-wider text-zinc-400">
                  <th scope="col" className="px-5 py-3.5">Article Title &amp; Slug</th>
                  <th scope="col" className="hidden px-5 py-3.5 sm:table-cell">Category</th>
                  <th scope="col" className="px-5 py-3.5">Status</th>
                  <th scope="col" className="hidden px-5 py-3.5 md:table-cell">Last Updated</th>
                  <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222630]">
                {recentPosts.map((post) => (
                  <tr key={post.id} className="transition-colors hover:bg-[#1c2029]">
                    <td className="max-w-md px-5 py-3.5">
                      <Link
                        href={`/admin/posts/${post.id}/edit`}
                        className="font-bold text-zinc-100 hover:text-orange-400 line-clamp-1 transition"
                      >
                        {post.title}
                      </Link>
                      <p className="mt-0.5 text-[11px] font-mono text-zinc-500 truncate">
                        /blog/{post.slug}
                      </p>
                    </td>

                    <td className="hidden sm:table-cell px-5 py-3.5">
                      <span className="rounded-lg bg-[#1f242d] border border-[#2c323e] px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                        {post.category}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-bold capitalize ${STATUS_BADGE[post.status] || "bg-[#222731] text-zinc-300"}`}>
                        {post.status}
                      </span>
                    </td>

                    <td className="hidden md:table-cell px-5 py-3.5 text-zinc-400 font-medium">
                      {formatDate(post.updatedAt)}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/posts/${post.id}/edit`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-400 hover:border-[#2e3440] hover:bg-[#222731] hover:text-zinc-100 transition"
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
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-400 hover:border-[#2e3440] hover:bg-[#222731] hover:text-zinc-100 transition"
                            title="View live post"
                            aria-label={`View ${post.title} on live blog`}
                          >
                            <Eye size={14} />
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={() => setConfirmId(post.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-transparent text-zinc-500 hover:border-red-500/30 hover:bg-red-950/40 hover:text-red-400 transition cursor-pointer"
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
        <p role="alert" className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm font-medium text-red-300">
          {deleteError}
        </p>
      )}

      {/* Delete Confirmation Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-[#161920] p-6 shadow-2xl border border-[#262b35] animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-black text-zinc-100">Delete this article?</h3>
            <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
              This action is permanent and cannot be undone. The article and its associated data will be removed.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmId(null)}
                className="flex-1 rounded-xl border border-[#2c323e] bg-[#1f242d] py-2 text-xs font-bold text-zinc-200 transition hover:bg-[#282e3a] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
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
    </div>
  );
}
