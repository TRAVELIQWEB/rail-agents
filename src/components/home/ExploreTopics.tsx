import { SectionHeading } from "@/components/ui/SectionHeading";
import { TopicCard } from "@/components/ui/TopicCard";
import { topics } from "@/data/topics";

export function ExploreTopics() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(254,215,170,0.18),_transparent_40%),linear-gradient(180deg,_#fffaf6_0%,_#ffffff_30%,_#fffdfb_100%)] py-8 sm:py-10 lg:py-12 2xl:py-14 wide:py-14">
      <div className="site-container relative">
        <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-[#ffedd5] blur-3xl opacity-70" aria-hidden="true" />
        <div className="absolute -right-6 bottom-0 h-44 w-44 rounded-full bg-[#fef3c7] blur-3xl opacity-60" aria-hidden="true" />

        <div className="relative z-10">
          <SectionHeading title="Explore by Topic" href="/guides" linkText="View All Topics" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
            {topics.map((topic) => (
              <TopicCard key={topic.title} topic={topic} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
