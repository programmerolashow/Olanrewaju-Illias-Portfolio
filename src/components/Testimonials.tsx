import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PenLine } from "lucide-react";
import RecommendationCard from "@/components/RecommendationCard";
import { useRecommendations } from "@/lib/feedback";

/** Home-page preview of approved recommendations (featured first). Always shows the invitation to write one. */
const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data } = useRecommendations();
  const recs = (data ?? []).slice(0, 3);

  return (
    <section id="testimonials" className="section-padding relative" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-16"
        >
          <p className="text-primary font-mono text-sm mb-4">Kind Words</p>
          <h2 className="section-heading">
            What People <span className="gradient-text">Say</span>
          </h2>
        </motion.div>

        {recs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6">
            {recs.map((r, index) => (
              <RecommendationCard key={r.id} rec={r} index={index} clamp />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex flex-col items-center gap-3 text-center md:mt-10"
        >
          {recs.length === 0 && (
            <p className="max-w-md text-muted-foreground">
              Worked with me, studied with me or built something together? I'd love to hear how it went.
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/recommendations#write"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <PenLine className="h-4 w-4" aria-hidden /> Leave a recommendation
            </Link>
            {(data?.length ?? 0) > 0 && (
              <Link
                to="/recommendations"
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                Read all {data!.length} <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
