import { SectionHeading } from "@/components/ui/SectionHeading";
import { TopicCard } from "@/components/ui/TopicCard";
import { topics } from "@/data/topics";

export function ExploreTopics() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#faf8f4]/60 via-white to-white py-8 sm:py-10 lg:py-12 2xl:py-14 wide:py-14">
      <div className="site-container">
        <SectionHeading title="Explore by Topic" href="/guides" linkText="View All Topics" />
        
        {/* 3-column grid for 6 topics = 2 complete rows, perfect desktop symmetry */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 xl:gap-5">
          {topics.map((topic) => (
            <TopicCard key={topic.title} topic={topic} />
          ))}
        </div>
      </div>
    </section>
  );
}
