import PageHeader from "@/components/PageHeader";
import Articles from "@/components/Articles";
import ScrollSection from "@/components/ScrollSection";
import ExploreMore from "@/components/ExploreMore";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pageMeta } from "@/config/pages";

const ArticlesPage = () => {
  usePageMeta(pageMeta.articles.title, pageMeta.articles.description);

  return (
    <>
      <PageHeader
        eyebrow="Articles"
        title="Technical Articles &"
        highlight="Project Lessons"
        description="What I'm writing up from real projects, practical experiments and clearly labelled research. Filter by track or search for a topic."
      />
      <Articles variant="full" />
      <ScrollSection>
        <ExploreMore />
      </ScrollSection>
    </>
  );
};

export default ArticlesPage;
