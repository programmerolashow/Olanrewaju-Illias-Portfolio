import { useState } from "react";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ScrollSection from "@/components/ScrollSection";
import ExploreMore from "@/components/ExploreMore";
import UpdateCard from "@/components/UpdateCard";
import { cn } from "@/lib/utils";
import { useUpdates } from "@/lib/updates";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pageMeta } from "@/config/pages";

const filters = [
  { value: "all", label: "All" },
  { value: "event", label: "Events" },
  { value: "post", label: "Posts" },
] as const;

const UpdatesPage = () => {
  usePageMeta(pageMeta.updates.title, pageMeta.updates.description);
  const { data, isLoading, isError } = useUpdates();
  const [filter, setFilter] = useState<(typeof filters)[number]["value"]>("all");
  const shown = (data ?? []).filter((u) => filter === "all" || u.kind === filter);

  return (
    <>
      <PageHeader
        eyebrow="Updates"
        title="Latest"
        highlight="Updates"
        description="Events I'm attending, speaking at or organising, and posts about what I'm working on."
      >
        <div className="inline-flex gap-1 rounded-full border border-border bg-secondary/60 p-1" role="group" aria-label="Filter updates">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                filter === f.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 pb-12 sm:px-6 md:pb-16">
        {isLoading && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading updates…
          </p>
        )}
        {isError && <p className="text-muted-foreground">Updates couldn't be loaded right now. Please try again later.</p>}
        {data && shown.length === 0 && <p className="text-muted-foreground">Nothing here yet. Check back soon.</p>}
        {shown.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((u, i) => (
              <UpdateCard key={u.id} update={u} index={i} />
            ))}
          </div>
        )}
      </div>

      <ScrollSection>
        <ExploreMore />
      </ScrollSection>
    </>
  );
};

export default UpdatesPage;
