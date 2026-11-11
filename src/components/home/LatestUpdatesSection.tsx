import Image from "next/image";
import { ArrowRight, Calendar, Clock, Newspaper } from "lucide-react";
import { InternalLink } from "@/components/ui/InternalLink";
import { getPublishedPosts } from "@/lib/posts";
import type { BlogPost } from "@/types/blog";

interface FallbackArticle {
  slug: string;
  title: string;
  category: string;
  publishedAt: string;
  readTime: string;
  excerpt: string;
  image: string;
}

const FALLBACK_UPDATES: FallbackArticle[] = [
  {
    slug: "fake-vip-quota-railway-ticket-scam-warning-for-travel-agents-and-passengers",
    title: "Beware of Fake VIP & Emergency Quota Scams: IRCTC & Vigilance Advisory",
    category: "Railway Guide",
    publishedAt: "2026-10-30T03:18:00.000Z",
    readTime: "6 min read",
    excerpt:
      "Commercial circulars warn against unauthorized touts forging official letterheads for Emergency Quotas (EQ). Understand the penal consequences under Section 143.",
    image: "/images/restored-train-passenger-journey.webp",
  },
  {
    slug: "indian-railways-senior-citizen-quota-lower-berth-booking-rules-eligibility-guide",
    title: "Indian Railways Senior Citizen Quota (SS): Eligibility & Lower Berth Rules",
    category: "Railway Guide",
    publishedAt: "2026-10-30T11:16:01.207Z",
    readTime: "7 min read",
    excerpt:
      "Complete guide to the Senior Citizen Lower Berth Quota: male and female age thresholds, coach-wise berth quotas, and automatic allotment conditions.",
    image: "/images/senior-citizen-quota-lower-berth-rules-cover.jpg",
  },
  {
    slug: "indian-railways-luggage-rules-free-baggage-allowance",
    title: "Indian Railways Luggage Rules: Free Allowance, Dimensions & Extra Charges",
    category: "Travel Guide",
    publishedAt: "2026-10-29T19:13:00.000Z",
    readTime: "6 min read",
    excerpt:
      "Official free luggage limits across 1AC, 2AC, 3AC, and Sleeper classes. Learn parcel booking rates, marginal allowance buffers, and penalties.",
    image: "/images/indian-railways-luggage-rules-cover.jpg",
  },
];

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "Recent";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Recent";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "Recent";
  }
}

export async function LatestUpdatesSection() {
  let displayPosts: Array<{
    slug: string;
    title: string;
    category: string;
    publishedAt: string;
    readTime: string;
    excerpt: string;
    image: string;
  }> = [];

  try {
    const livePosts: BlogPost[] = await getPublishedPosts();
    if (livePosts && livePosts.length > 0) {
      displayPosts = livePosts.slice(0, 3).map((post, idx) => {
        const fallback = FALLBACK_UPDATES[idx % FALLBACK_UPDATES.length];
        return {
          slug: post.slug,
          title: post.title,
          category: post.category || "Railway Guide",
          publishedAt: post.publishedAt || post.createdAt || "",
          readTime: `${Math.max(3, Math.ceil((post.content?.replace(/<[^>]*>/g, "").split(/\s+/).length || 600) / 200))} min read`,
          excerpt: post.excerpt || "Read the latest official circular, ticketing policy update, or commercial passenger notification.",
          image: post.featuredImage || fallback.image,
        };
      });
    }
  } catch (error) {
    console.error("LatestUpdatesSection: Failed to fetch posts, using fallback:", error);
  }

  if (displayPosts.length === 0) {
    displayPosts = FALLBACK_UPDATES;
  }

  return (
    <section
      aria-labelledby="latest-updates-heading"
      className="border-b border-[#E5EAF0] bg-[#F4F5F7]/70 py-12 sm:py-16 lg:py-20"
    >
      <div className="site-container">
        {/* Section Header */}
        <div className="flex flex-col items-start justify-between gap-4 border-b border-[#E5EAF0] pb-6 sm:flex-row sm:items-end sm:pb-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#FFF1E7] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#F36B21] border border-[#F36B21]/20">
              <Newspaper className="h-3.5 w-3.5 text-[#F36B21]" aria-hidden="true" />
              Real-Time Bulletins
            </span>
            <h2
              id="latest-updates-heading"
              className="mt-2 text-2xl font-black tracking-tight text-[#142B45] sm:text-3xl lg:text-4xl"
            >
              Latest Railway Updates &amp; Circulars
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#667085] sm:text-base">
              Timely analysis of recent policy revisions, vigilance advisories, and booking operational guidelines.
            </p>
          </div>

          <InternalLink
            href="/blog"
            prefetch={false}
            className="group inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-[#E5EAF0] bg-white px-4 py-2 text-sm font-bold text-[#F36B21] shadow-2xs hover:border-[#F36B21]/50 hover:bg-[#FFF1E7]/40 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F36B21]"
          >
            <span>Browse all bulletins</span>
            <ArrowRight
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1"
            />
          </InternalLink>
        </div>

        {/* 3-Card Responsive Grid */}
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          {displayPosts.map((post) => (
            <article
              key={post.slug}
              className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E5EAF0] bg-white shadow-2xs transition-all duration-200 motion-reduce:transition-none hover:-translate-y-1.5 hover:border-[#F36B21]/45 hover:shadow-[0_16px_36px_-8px_rgba(20,43,69,0.1),0_4px_12px_-2px_rgba(243,107,33,0.06)]"
            >
              <div>
                {/* 16:9 Cover Image */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#E5EAF0]">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-3 rounded-md bg-[#142B45]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-xs">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6">
                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-[#667085]">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-[#F36B21]" aria-hidden="true" />
                      {formatDate(post.publishedAt)}
                    </span>
                    <span className="text-[#E5EAF0]">•</span>
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-3 text-base font-bold leading-snug text-[#142B45] transition-colors group-hover:text-[#F36B21] sm:text-lg line-clamp-2">
                    <InternalLink href={`/blog/${post.slug}`}>
                      {post.title}
                    </InternalLink>
                  </h3>

                  {/* Excerpt */}
                  <p className="mt-2 text-xs leading-relaxed text-[#667085] sm:text-sm line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Bottom Footer Link */}
              <div className="border-t border-[#E5EAF0] bg-[#F4F5F7]/30 px-5 py-3.5 sm:px-6">
                <InternalLink
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F36B21] transition-colors group-hover:text-[#F36B21]"
                >
                  <span>Read full bulletin</span>
                  <ArrowRight
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform duration-150 group-hover:translate-x-1"
                  />
                </InternalLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
