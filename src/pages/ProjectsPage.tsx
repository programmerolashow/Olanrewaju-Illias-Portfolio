import PageHeader from "@/components/PageHeader";
import Projects from "@/components/Projects";
import ExploreMore from "@/components/ExploreMore";
import { usePageMeta } from "@/hooks/use-page-meta";

const ProjectsPage = () => {
  usePageMeta("Projects", "Featured and noteworthy projects by Olanrewaju Illias, with live demos and source code.");

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Things I've"
        highlight="Built"
        description="Featured builds first, then smaller projects worth a look. Each one links to its source code and, where available, a live demo."
      />
      <Projects variant="full" />
      <ExploreMore />
    </>
  );
};

export default ProjectsPage;
