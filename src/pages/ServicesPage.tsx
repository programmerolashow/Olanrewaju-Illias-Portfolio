import PageHeader from "@/components/PageHeader";
import Services from "@/components/Services";
import ExploreMore from "@/components/ExploreMore";
import { usePageMeta } from "@/hooks/use-page-meta";

const ServicesPage = () => {
  usePageMeta(
    "Services",
    "Full-stack, AI integration, API, database, fintech, QA, DevOps and documentation services by Olanrewaju Illias.",
  );

  return (
    <>
      <PageHeader
        eyebrow="Services"
        title="Services Built Around"
        highlight="Real Problems"
        description="I build full-stack applications and AI-powered software products, integrating frontend interfaces, backend services, databases and external APIs to solve practical problems. Open any service to see everything it covers."
      />
      <Services variant="full" />
      <ExploreMore />
    </>
  );
};

export default ServicesPage;
