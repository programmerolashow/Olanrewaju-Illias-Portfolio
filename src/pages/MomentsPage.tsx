import PageHeader from "@/components/PageHeader";
import Gallery from "@/components/Gallery";
import ScrollSection from "@/components/ScrollSection";
import ExploreMore from "@/components/ExploreMore";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pageMeta } from "@/config/pages";

const MomentsPage = () => {
  usePageMeta(pageMeta.moments.title, pageMeta.moments.description);

  return (
    <>
      <PageHeader
        eyebrow="Moments"
        title="Beyond the"
        highlight="Code"
        description="Snapshots from events, talks, community meetups and the people I build with."
      />
      <Gallery showHeader={false} />
      <ScrollSection>
        <ExploreMore />
      </ScrollSection>
    </>
  );
};

export default MomentsPage;
