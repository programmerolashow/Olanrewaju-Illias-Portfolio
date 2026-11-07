import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, ExternalLink, Loader2, MapPin } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { StatusBadge } from "@/components/UpdateCard";
import MotionImage from "@/components/MotionImage";
import UpdateComments from "@/components/UpdateComments";
import UpdateBanner from "@/components/UpdateBanner";
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
        <div className="max-w-4xl">
          {/* Photos only, even when the post also has videos; those play below. */}
          <UpdateBanner images={update.images} />

          {update.videos?.length > 0 && (
            <div className="mb-10 space-y-6">
              {update.videos.map((video, i) => (
                <figure key={video.url}>
                  <video
                    src={video.url}
                    poster={video.posterUrl}
                    controls
                    playsInline
                    // Only the first video fetches its length up front; the rest load nothing until played.
                    preload={i === 0 ? "metadata" : "none"}
                    aria-label={video.caption || `Video ${i + 1}`}
                    className="aspect-video max-h-[75vh] w-full rounded-2xl border border-border bg-black object-contain"
                  />
                  {video.caption && <figcaption className="mt-2 text-sm text-muted-foreground">{video.caption}</figcaption>}
                </figure>
              ))}
            </div>
          )}

          {update.body && <p className="max-w-3xl whitespace-pre-line leading-relaxed text-foreground/90 md:text-lg">{update.body}</p>}

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
              {update.images.slice(1).map((img, i) => (
                <a key={img.url} href={img.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl border border-border">
                  <MotionImage src={img.url} alt={img.alt} delay={(i % 3) * 0.1} className="aspect-square" />
                </a>
              ))}
            </div>
          )}

          <UpdateComments updateId={update.id} />

          <Link to="/updates" className="mt-12 inline-flex items-center gap-2 font-semibold text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden /> All updates
          </Link>
        </div>
      </article>
    </>
  );
};

export default UpdateDetailPage;
