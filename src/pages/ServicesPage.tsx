import PageHeader from "@/components/PageHeader";
import Services from "@/components/Services";
import ScrollSection from "@/components/ScrollSection";
import ExploreMore from "@/components/ExploreMore";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pageMeta } from "@/config/pages";

const ServicesPage = () => {
  usePageMeta(pageMeta.services.title, pageMeta.services.description);

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Services Built Around"
        highlight="Real Problems"
        description="I build full-stack applications and AI-powered software products, integrating frontend interfaces, backend services, databases and external APIs to solve practical problems. Open any service to see everything it covers."
      />
      <Services variant="full" />
      <ScrollSection>
        <ExploreMore />
      </ScrollSection>
    </>
  );
};

export default ServicesPage;
