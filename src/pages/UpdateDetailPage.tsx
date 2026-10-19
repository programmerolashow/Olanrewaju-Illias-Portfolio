import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, ExternalLink, Loader2, MapPin } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { StatusBadge } from "@/components/UpdateCard";
import { displayDate, useUpdates } from "@/lib/updates";
import { usePageMeta } from "@/hooks/use-page-meta";

const UpdateDetailPage = () => {
  const { id = "" } = useParams();
  const { data, isLoading } = useUpdates();
  const update = data?.find((u) => u.id === id);
  usePageMeta(update?.title, update?.body.slice(0, 160));

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center gap-2 px-4 pb-24 pt-40 text-muted-foreground sm:px-6">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Loading…
      </div>
    );
  }

  if (!update) {
    return (
      <div className="container mx-auto px-4 pb-24 pt-40 sm:px-6">
        <h1 className="text-2xl font-bold">This update isn't available.</h1>
        <p className="mt-2 text-muted-foreground">It may have been removed or unpublished.</p>
        <Link to="/updates" className="mt-6 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All updates
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow={update.title}
        parent={{ label: "Updates", to: "/updates" }}
        title=""
        highlight={update.title}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <StatusBadge update={update} />
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4" aria-hidden />
            {displayDate(update)}
          </span>
          {update.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4" aria-hidden />
              {update.location}
            </span>
          )}
        </div>
      </PageHeader>

      <article className="container mx-auto px-4 pb-16 sm:px-6 md:pb-24">
        {update.images[0] && (
          <img
            src={update.images[0].url}
            alt={update.images[0].alt}
            decoding="async"
            className="mb-8 max-h-[70vh] w-full rounded-2xl border border-border object-cover"
          />
        )}

        {update.body && <p className="max-w-3xl whitespace-pre-line text-foreground/90 md:text-lg">{update.body}</p>}

        {update.linkUrl && (
          <a
            href={update.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            style={{ background: "var(--gradient-primary)" }}
          >
            {update.kind === "event" ? "Event details" : "Read more"}
            <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        )}

        {update.images.length > 1 && (
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3">
            {update.images.slice(1).map((img) => (
              <a key={img.url} href={img.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-border">
                <img src={img.url} alt={img.alt} loading="lazy" decoding="async" className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105" />
              </a>
            ))}
          </div>
        )}

        <Link to="/updates" className="mt-12 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All updates
        </Link>
      </article>
    </>
  );
};

export default UpdateDetailPage;
