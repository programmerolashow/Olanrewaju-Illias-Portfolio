import { Link, useLocation } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { pageLinks } from "@/data/navigation";

/** Closing band for dedicated pages: links to the sibling pages plus a contact call to action. */
const ExploreMore = () => {
  const { pathname } = useLocation();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const others = pageLinks.filter((link) => link.to !== pathname);

  return (
    <section ref={ref} aria-labelledby="explore-heading" className="pb-16 pt-6 sm:pb-20 md:pb-24">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="explore-heading" className="text-xl font-bold sm:text-2xl">
            Keep exploring
          </h2>
          <Link to="/" className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Back to home <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 md:gap-4">
          {others.map((link, index) => (
            <motion.div
              key={link.to}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Link
                to={link.to}
                className="glass-card group flex h-full items-center gap-4 rounded-2xl p-4 transition-colors duration-300 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <link.icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-foreground">{link.label}</span>
                  <span className="block text-sm text-muted-foreground">{link.description}</span>
                </span>
                <ArrowUpRight
                  className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden
                />
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative mt-8 overflow-hidden rounded-3xl border border-primary/30 p-6 sm:p-8 md:mt-10 md:p-10"
        >
          <div aria-hidden className="absolute inset-0 opacity-[0.08]" style={{ background: "var(--gradient-primary)" }} />
          <div className="relative flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Have something to <span className="gradient-text">build?</span>
              </h2>
              <p className="mt-2 max-w-xl text-sm text-muted-foreground sm:text-base">
                A product, a feature or a codebase that needs care. Tell me what you are working on.
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }} className="shrink-0">
              <Link
                to="/#contact"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground"
                style={{ background: "var(--gradient-primary)" }}
              >
                Start a conversation <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ExploreMore;
