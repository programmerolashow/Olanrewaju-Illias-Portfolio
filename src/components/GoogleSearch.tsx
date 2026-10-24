import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { site } from "@/config/site";

const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(site.name)}`;

/** "Find me on Google": a screenshot of the search result for my name, linking to a live search. */
const GoogleSearch = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="google" className="section-padding relative" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.2fr] lg:gap-14">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <p className="mb-4 font-mono text-sm text-primary">Find Me Online</p>
            <h2 className="section-heading">
              Searchable on <span className="gradient-text">Google</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground md:text-lg lg:mx-0">
              Search my name and Google pulls together my work, projects and community involvement from across the web.
            </p>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              <Search className="h-4 w-4" aria-hidden /> Search “{site.name}” <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </motion.div>

          <motion.a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 }}
            whileHover={{ y: -4 }}
            className="glass-card block overflow-hidden rounded-2xl p-2 sm:p-3"
            aria-label={`Google search results for ${site.name}`}
          >
            <img
              src="/press/google-search.webp"
              alt={`Google search result summarising ${site.name}'s technical expertise, projects and community involvement`}
              loading="lazy"
              width={760}
              height={625}
              className="h-auto w-full rounded-xl"
            />
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default GoogleSearch;
