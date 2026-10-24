import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PenLine } from "lucide-react";
import RecommendationCard from "@/components/RecommendationCard";
import { useRecommendations } from "@/lib/feedback";

const SLOTS = 3;
const ROTATE_MS = 3000;

/** Home-page preview of approved recommendations (featured first). Always shows the invitation to write one. */
const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const reduce = useReducedMotion();
  const { data } = useRecommendations();
  const all = useMemo(() => data ?? [], [data]);
  const [shown, setShown] = useState<string[]>([]);
  const [paused, setPaused] = useState(false);

  // Start from the first three (featured first); reset whenever the list changes.
  useEffect(() => {
    setShown(all.slice(0, SLOTS).map((r) => r.id));
  }, [all]);

  // Every 3s, swap one random card for a random recommendation that isn't on screen.
  useEffect(() => {
    if (reduce || paused || all.length <= SLOTS) return;
    const tick = window.setInterval(() => {
      if (document.hidden) return;
      setShown((current) => {
        const hidden = all.filter((r) => !current.includes(r.id));
        if (hidden.length === 0) return current;
        const next = [...current];
        next[Math.floor(Math.random() * next.length)] = hidden[Math.floor(Math.random() * hidden.length)].id;
        return next;
      });
    }, ROTATE_MS);
    return () => window.clearInterval(tick);
  }, [all, reduce, paused]);

  const recs = shown.map((id) => all.find((r) => r.id === id)).filter((r) => r !== undefined);

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
          <div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {recs.map((r, index) => (
              <div key={index} className="grid">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.div key={r.id} exit={{ opacity: 0, y: -16, transition: { duration: 0.3 } }} className="h-full">
                    <RecommendationCard rec={r} index={index} clamp />
                  </motion.div>
                </AnimatePresence>
              </div>
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
