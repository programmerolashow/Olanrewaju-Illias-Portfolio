import { Loader2, PenLine } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ScrollSection from "@/components/ScrollSection";
import ExploreMore from "@/components/ExploreMore";
import RecommendationCard from "@/components/RecommendationCard";
import RecommendationForm from "@/components/RecommendationForm";
import { useRecommendations } from "@/lib/feedback";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pageMeta } from "@/config/pages";

const RecommendationsPage = () => {
  usePageMeta(pageMeta.recommendations.title, pageMeta.recommendations.description);
  const { data, isLoading } = useRecommendations();
  const recs = data ?? [];

  return (
    <>
      <PageHeader
        eyebrow="Recommendations"
        title="Kind"
        highlight="Words"
        description="What colleagues, managers, classmates, course-mates and collaborators say about working with me."
      >
        <a
          href="#write"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <PenLine className="h-4 w-4" aria-hidden /> Leave a recommendation
        </a>
      </PageHeader>

      <div className="container mx-auto px-4 pb-16 sm:px-6 md:pb-24">
        {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading recommendations" />}

        {recs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {recs.map((r, i) => (
              <RecommendationCard key={r.id} rec={r} index={i} />
            ))}
          </div>
        )}

        <ScrollSection>
          <section id="write" aria-labelledby="write-heading" className="mt-14 scroll-mt-28 md:mt-20">
            <div className="glass-card mx-auto max-w-3xl rounded-3xl p-5 sm:p-8">
              <p className="font-mono text-sm text-primary">Worked with me?</p>
              <h2 id="write-heading" className="mt-1 text-2xl font-bold text-foreground md:text-3xl">
                Leave a <span className="gradient-text">recommendation</span>
              </h2>
              <p className="mb-6 mt-2 text-sm text-muted-foreground md:text-base">
                {recs.length === 0
                  ? "Be the first. A few honest sentences about a project, a class or a team we shared helps recruiters see how I work."
                  : "A few honest sentences about a project, a class or a team we shared helps recruiters see how I work."}
              </p>
              <RecommendationForm />
            </div>
          </section>
        </ScrollSection>
      </div>

      <ExploreMore />
    </>
  );
};

export default RecommendationsPage;
