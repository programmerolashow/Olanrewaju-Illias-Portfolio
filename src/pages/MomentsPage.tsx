import PageHeader from "@/components/PageHeader";
import Gallery from "@/components/Gallery";
import ExploreMore from "@/components/ExploreMore";
import { usePageMeta } from "@/hooks/use-page-meta";

const MomentsPage = () => {
  usePageMeta("Moments", "Events, talks, community meetups and the people Olanrewaju Illias builds with.");

  return (
    <>
      <PageHeader
        eyebrow="Moments"
        title="Beyond the"
        highlight="Code"
        description="Snapshots from events, talks, community meetups and the people I build with."
      />
      <Gallery showHeader={false} />
      <ExploreMore />
    </>
  );
};

export default MomentsPage;
