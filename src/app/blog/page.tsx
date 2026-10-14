// Public /blog listing page — shows only published posts
import type { Metadata } from "next";
import { getPublishedPosts } from "@/lib/posts";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BlogList } from "@/components/blog/BlogList";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Blog — Railway Travel & Agent Guides",
  description:
    "Practical articles on railway travel, IRCTC agent guidance, booking tips, and travel resources from RailAgents.",
  alternates: { canonical: `${siteConfig.url}/blog` },
  openGraph: {
    title: "Blog — Railway Travel & Agent Guides | RailAgents",
    description: "Practical articles on railway travel, IRCTC agent guidance, booking tips, and travel resources.",
    url: `${siteConfig.url}/blog`,
  },
};

// Revalidate every 60 seconds so new posts appear promptly
export const revalidate = 60;

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div className="flex min-h-screen flex-col bg-[#fff9f5]">
      <Header />
      <main className="relative flex-1 overflow-hidden py-10 sm:py-14 lg:py-16">
        {/* Decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-orange-100/50 blur-[90px]" />
        <div aria-hidden className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-orange-200/30 blur-[100px]" />

        <div className="site-container relative">
          <div className="mb-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#f5dfcf] bg-white/70 px-3.5 py-2 text-xs font-[800] uppercase tracking-[0.12em] text-[#e96713] shadow-sm backdrop-blur-md">
              RailAgents Blog
            </div>
            <h1 className="text-[clamp(2rem,6vw,3.25rem)] font-[850] leading-[1.1] tracking-[-0.045em] text-[var(--navy)]">
              Railway Travel & Agent Guides
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Practical articles on railway travel, IRCTC agent guidance, booking tips, and resources to help you serve your customers better.
            </p>
          </div>

          <BlogList posts={posts} />

          {posts.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-16 text-center">
              <p className="text-slate-500">No blog posts published yet. Check back soon!</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

