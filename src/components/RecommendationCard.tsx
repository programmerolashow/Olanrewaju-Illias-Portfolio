import { motion } from "framer-motion";
import { Linkedin, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { initials, recommenderLine, relationshipLabels, type Recommendation } from "@/lib/feedback";

/** Long recommendations are clamped on the home page; the full text is always on /recommendations. */
const RecommendationCard = ({ rec, index = 0, clamp = false }: { rec: Recommendation; index?: number; clamp?: boolean }) => (
  <motion.figure
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.5, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -4 }}
    className="glass-card flex h-full flex-col rounded-2xl p-5 sm:p-6"
  >
    <div className="mb-4 flex items-start justify-between gap-3">
      <Quote className="h-7 w-7 shrink-0 text-primary" aria-hidden />
      <div className="flex flex-wrap justify-end gap-1.5">
        {rec.featured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Star className="h-3 w-3" aria-hidden /> Featured
          </span>
        )}
        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {relationshipLabels[rec.relationship]}
        </span>
      </div>
    </div>

    <blockquote className={cn("flex-1 whitespace-pre-line text-sm leading-relaxed text-foreground/90 sm:text-base", clamp && "line-clamp-6")}>
      “{rec.body}”
    </blockquote>

    <figcaption className="mt-5 flex items-center gap-3">
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-primary-foreground"
        style={{ background: "var(--gradient-primary)" }}
      >
        {initials(rec.name)}
      </span>
      <div className="min-w-0">
        {rec.linkedinUrl ? (
          <a
            href={rec.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="inline-flex items-center gap-1.5 font-semibold text-foreground transition-colors hover:text-primary"
          >
            {rec.name}
            <Linkedin className="h-3.5 w-3.5" aria-label="LinkedIn profile" />
          </a>
        ) : (
          <p className="font-semibold text-foreground">{rec.name}</p>
        )}
        <p className="truncate text-xs text-muted-foreground sm:text-sm">{recommenderLine(rec)}</p>
      </div>
    </figcaption>
  </motion.figure>
);

export default RecommendationCard;
