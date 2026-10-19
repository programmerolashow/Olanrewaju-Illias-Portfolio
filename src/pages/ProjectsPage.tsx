import PageHeader from "@/components/PageHeader";
import Projects from "@/components/Projects";
import ScrollSection from "@/components/ScrollSection";
import ExploreMore from "@/components/ExploreMore";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pageMeta } from "@/config/pages";

const ProjectsPage = () => {
  usePageMeta(pageMeta.projects.title, pageMeta.projects.description);

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Things I've"
        highlight="Built"
        description="Featured builds first, then smaller projects worth a look. Each one links to its source code and, where available, a live demo."
      />
      <ScrollSection>
        <Projects variant="full" />
      </ScrollSection>
      <ScrollSection>
        <ExploreMore />
      </ScrollSection>
    </>
  );
};

export default ProjectsPage;
