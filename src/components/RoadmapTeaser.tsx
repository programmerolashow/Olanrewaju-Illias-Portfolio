import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Map as MapIcon } from "lucide-react";

/** Home-page banner pointing beginners to the 12-month roadmap (/roadmap). */
const RoadmapTeaser = () => (
  <section id="roadmap-teaser" aria-labelledby="roadmap-teaser-heading" className="py-12 md:py-16">
    <div className="container mx-auto px-4 sm:px-6">
      <div className="glass-card relative overflow-hidden rounded-3xl p-6 sm:p-8 md:p-10">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary sm:flex">
              <MapIcon className="h-6 w-6" aria-hidden />
            </span>
            <div>
              <p className="font-mono text-sm text-primary">For beginners</p>
              <h2 id="roadmap-teaser-heading" className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
                Starting your software engineering journey?
              </h2>
              <p className="mt-2 max-w-2xl text-muted-foreground md:text-lg">
                Follow my 12-month roadmap: what to learn each month, what to build, the mistakes to avoid, and a tracker to
                tick off your milestones. Learn. Build. Break. Fix. Improve. Repeat.
              </p>
            </div>
          </div>
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="shrink-0">
            <Link
              to="/roadmap"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground sm:text-base"
              style={{ background: "var(--gradient-primary)" }}
            >
              See the roadmap
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

export default RoadmapTeaser;
