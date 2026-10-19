import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import UpdateCard from "@/components/UpdateCard";
import { useUpdates } from "@/lib/updates";

/** Home-page strip of the three most relevant updates. Renders nothing until there's something to show. */
const LatestUpdates = () => {
  const { data } = useUpdates();
  if (!data || data.length === 0) return null;
  const latest = data.slice(0, 3);

  return (
    <section id="updates" aria-labelledby="updates-heading" className="section-padding relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-12">
          <div>
            <p className="mb-3 font-mono text-sm text-primary">What I'm Up To</p>
            <h2 id="updates-heading" className="section-heading">
              Latest <span className="gradient-text">Updates</span>
            </h2>
          </div>
          {data.length > latest.length && (
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/updates"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                All updates
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.div>
          )}
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((u, i) => (
            <UpdateCard key={u.id} update={u} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default LatestUpdates;
