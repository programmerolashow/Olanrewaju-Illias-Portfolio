import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, Rss } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ScrollSection from "@/components/ScrollSection";
import ExploreMore from "@/components/ExploreMore";
import UpdateCard from "@/components/UpdateCard";
import SubscribeForm from "@/components/SubscribeForm";
import { cn } from "@/lib/utils";
import { useUpdates } from "@/lib/updates";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pageMeta } from "@/config/pages";

const filters = [
  { value: "all", label: "All" },
  { value: "event", label: "Events" },
  { value: "post", label: "Posts" },
] as const;

/** Where the confirm / unsubscribe links in emails land (api/subscribe.js redirects here with ?subscription=…). */
const subscriptionNotes: Record<string, { text: string; error?: boolean }> = {
  confirmed: { text: "You're subscribed. You'll get an email when I post something new." },
  unsubscribed: { text: "You've been unsubscribed and won't get any more emails." },
  invalid: { text: "That link is no longer valid. Sign up again below if you'd like updates.", error: true },
  error: { text: "Something went wrong with that link. Please try again later.", error: true },
};

const UpdatesPage = () => {
  usePageMeta(pageMeta.updates.title, pageMeta.updates.description);
  const [params] = useSearchParams();
  const note = subscriptionNotes[params.get("subscription") ?? ""];
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
        <a
          href="/api/feed"
          className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 align-top text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Rss className="h-4 w-4" aria-hidden /> RSS feed
        </a>
      </PageHeader>

      <div className="container mx-auto px-4 pb-12 sm:px-6 md:pb-16">
        {note && (
          <p
            role="status"
            className={cn(
              "mb-6 rounded-2xl border px-4 py-3 text-sm font-medium",
              note.error ? "border-destructive/40 text-destructive" : "border-primary/40 bg-primary/10 text-foreground",
            )}
          >
            {note.text}
          </p>
        )}
        <SubscribeForm className="mb-8 max-w-2xl" />
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
