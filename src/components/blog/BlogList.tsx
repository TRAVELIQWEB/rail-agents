"use client";

import { useState } from "react";
import Link from "next/link";
import type { BlogPost } from "@/types/blog";
import { BLOG_CATEGORIES } from "@/types/blog";
import { Calendar, User, Clock, Tag, Search } from "lucide-react";

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];

  const filtered = posts.filter((post) => {
    const matchCat = activeCategory === "All" || post.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      post.title.toLowerCase().includes(q) ||
      post.excerpt.toLowerCase().includes(q) ||
      post.tags.some((t) => t.toLowerCase().includes(q)) ||
      post.category.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div>
      {/* Search + Category filter */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles..."
            className="h-11 w-full rounded-full border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 shadow-xs outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition ${
                activeCategory === cat
                  ? "bg-orange-500 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">No articles found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <p className="mt-6 text-center text-xs text-slate-400">
          Showing {filtered.length} of {posts.length} article{posts.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  const publishDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const readingTime = Math.max(1, Math.round(post.content.replace(/<[^>]*>/g, "").split(/\s+/).length / 200));

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Featured image */}
      {post.featuredImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.featuredImage}
          alt={post.featuredImageAlt || post.title}
          className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      ) : (
        <div className="flex aspect-[16/9] w-full items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50">
          <span className="text-3xl font-black text-orange-200">{post.title[0]}</span>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {/* Category */}
        <span className="mb-3 inline-flex items-center self-start rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold text-orange-700">
          {post.category}
        </span>

        {/* Title */}
        <h2 className="mb-2 text-base font-[800] leading-tight text-[var(--navy)] line-clamp-2 group-hover:text-orange-700 transition-colors">
          {post.title}
        </h2>

        {/* Excerpt */}
        <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-500 line-clamp-2">
          {post.excerpt}
        </p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full border border-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                <Tag size={9} />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <User size={11} />
            {post.author}
          </span>
          {publishDate && (
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {publishDate}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {readingTime} min
          </span>
        </div>
      </div>
    </Link>
  );
}

