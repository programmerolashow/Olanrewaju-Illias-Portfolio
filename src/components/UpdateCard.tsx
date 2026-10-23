import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import MotionImage from "@/components/MotionImage";
import { displayDate, eventStatus, statusLabel, type Update } from "@/lib/updates";

export const StatusBadge = ({ update, className }: { update: Update; className?: string }) => {
  const status = eventStatus(update);
  if (!status) return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        status === "happening" && "bg-emerald-500 text-white",
        status === "upcoming" && "bg-primary text-primary-foreground",
        status === "past" && "bg-secondary text-muted-foreground",
        className,
      )}
    >
      {status === "happening" && (
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
      )}
      {statusLabel[status]}
    </span>
  );
};

const UpdateCard = ({ update, index = 0 }: { update: Update; index?: number }) => {
  const cover = update.images[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="glass-card group relative flex h-full flex-col overflow-hidden rounded-2xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-secondary">
        {cover ? (
          <MotionImage src={cover.url} alt={cover.alt} delay={index * 0.08} />
        ) : (
          <div className="flex h-full items-center justify-center text-primary/60">
            <Megaphone className="h-10 w-10" aria-hidden />
          </div>
        )}
        <StatusBadge update={update} className="absolute left-3 top-3" />
        {update.images.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {update.images.length} photos
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-xs uppercase tracking-wide text-primary">{update.kind === "event" ? "Event" : "Post"}</p>
        <h3 className="mt-1 text-lg font-semibold text-foreground transition-colors group-hover:text-primary">
          <Link to={`/updates/${update.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {update.title}
          </Link>
        </h3>
        {update.body && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{update.body}</p>}
        <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden />
            {displayDate(update)}
          </span>
          {update.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              {update.location}
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
};

export default UpdateCard;
