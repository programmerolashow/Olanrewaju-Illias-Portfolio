import { AnimatePresence, LayoutGroup, motion, useInView } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  Database,
  Download,
  FileText,
  GitBranch,
  GraduationCap,
  Landmark,
  Layers,
  Lightbulb,
  NotebookPen,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";
import {
  articleDate,
  articleTracks,
  fileKind,
  matchPlannedTopic,
  plannedTopics,
  useArticles,
  type Article,
  type TrackId,
} from "@/lib/articles";

// Published articles come from /admin; planned topics live in src/lib/articles.ts. An article uploaded for a planned
// topic takes that topic's place (Planned → Published), so a topic is never listed twice.

interface ArticleCategory {
  id: TrackId;
  label: string;
  icon: LucideIcon;
  topics: string[];
}

const trackIcons: Record<TrackId, LucideIcon> = {
  "full-stack": Layers,
  ai: Bot,
  database: Database,
  quality: ShieldCheck,
  product: Lightbulb,
  fintech: Landmark,
  devops: GitBranch,
  "case-studies": NotebookPen,
};

const categories: ArticleCategory[] = articleTracks.map((track) => ({
  ...track,
  icon: trackIcons[track.id],
  topics: plannedTopics[track.id],
}));

interface ListItem {
  key: string;
  title: string;
  category: ArticleCategory;
  /** Set for published articles; planned topics have none. */
  article: Article | null;
}

const categoryOf = (track: string) => categories.find((c) => c.id === track) ?? categories[0];

/**
 * Every topic once: published articles first (newest first), then the planned topics nobody has written yet.
 * An article fills the planned topic it was linked to in /admin; older uploads without a link are matched by title.
 */
const useArticleList = () => {
  const { data } = useArticles();
  return useMemo(() => {
    const filled = new Set<string>();
    const published: ListItem[] = (data ?? []).map((article) => {
      const topic = article.topic ?? matchPlannedTopic(article.title)?.topic;
      if (topic) filled.add(topic);
      return { key: article.id, title: article.title, category: categoryOf(article.track), article };
    });
    const planned: ListItem[] = categories.flatMap((category) =>
      category.topics
        .filter((topic) => !filled.has(topic))
        .map((topic) => ({ key: `${category.id}:${topic}`, title: topic, category, article: null })),
    );
    const all = [...published, ...planned];
    const countIn = (id: string) => all.filter((item) => item.category.id === id).length;
    const stats = [
      { value: all.length, label: "Topics" },
      { value: categories.length, label: "Tracks" },
      { value: published.length, label: "Published" },
    ];
    return { all, countIn, stats };
  }, [data]);
};

const INITIAL_VISIBLE = 9;

const StatStrip = ({ stats, inView, delay = 0.15 }: { stats: { value: number; label: string }[]; inView: boolean; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.5, delay }}
    className="mb-6 grid grid-cols-3 gap-3 md:mb-8"
  >
    {stats.map((stat) => (
      <div key={stat.label} className="glass-card rounded-2xl p-4 text-center sm:p-5">
        <p className="text-2xl font-bold gradient-text sm:text-3xl">{stat.value}</p>
        <p className="mt-1 font-mono text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
      </div>
    ))}
  </motion.div>
);

/** Home-page teaser: the writing tracks, each opening /articles filtered to that track. */
const ArticlesPreview = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { all, countIn, stats } = useArticleList();

  return (
    <section id="articles" className="section-padding relative" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center md:mb-14"
        >
          <p className="mb-4 font-mono text-sm text-primary">Writing</p>
          <h2 className="section-heading">
            Technical Articles & <span className="gradient-text">Project Lessons</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            What I'm writing up from real projects, practical experiments and clearly labelled research.
          </p>
        </motion.div>

        <div className="mx-auto max-w-5xl">
          <StatStrip stats={stats} inView={isInView} />

          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <Link
                  to={`/articles?track=${category.id}`}
                  className="glass-card group flex h-full flex-col rounded-2xl p-4 transition-colors duration-300 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
                >
                  <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <category.icon className="h-[1.1rem] w-[1.1rem]" aria-hidden />
                  </span>
                  <span className="flex-1 text-sm font-semibold leading-snug text-foreground sm:text-base">
                    {category.label}
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground transition-colors group-hover:text-primary">
                    {countIn(category.id)} topics
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex justify-center md:mt-12"
        >
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/articles"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Browse all {all.length} topics
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

/** Full /articles page body: search, track filters and the topic grid. */
const ArticlesFull = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [searchParams, setSearchParams] = useSearchParams();
  const trackParam = searchParams.get("track");
  const activeId = categories.some((c) => c.id === trackParam) ? (trackParam as string) : "all";
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const { all, countIn, stats } = useArticleList();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (a) =>
        (activeId === "all" || a.category.id === activeId) &&
        (!q || a.title.toLowerCase().includes(q) || a.article?.summary.toLowerCase().includes(q)),
    );
  }, [all, activeId, query]);

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);

  // The selected track lives in the URL (?track=ai) so filtered views can be shared and survive a refresh.
  const selectCategory = (id: string) => {
    setSearchParams(id === "all" ? {} : { track: id }, { replace: true, preventScrollReset: true });
    setShowAll(false);
  };

  const filters = [{ id: "all", label: "All topics", icon: FileText, count: all.length }].concat(
    categories.map((c) => ({ id: c.id, label: c.label, icon: c.icon, count: countIn(c.id) })),
  );

  return (
    <section aria-label="All article topics" className="relative pb-12 md:pb-16" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <StatStrip stats={stats} inView={isInView} delay={0} />

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-6 space-y-4 md:mb-8"
        >
          <div className="relative mx-auto max-w-xl">
            <label htmlFor="article-search" className="sr-only">
              Search article topics
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              id="article-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowAll(false);
              }}
              placeholder="Search topics, e.g. Prisma, prompt injection, CI/CD"
              className="w-full rounded-full border border-border bg-secondary/60 py-3 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div
            role="group"
            aria-label="Filter by track"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-wrap lg:justify-center lg:overflow-visible lg:px-0"
          >
            {filters.map((filter) => {
              const selected = filter.id === activeId;
              return (
                <button
                  key={filter.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectCategory(filter.id)}
                  className={cn(
                    "relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected ? "text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="articles-filter"
                      className="absolute inset-0 rounded-full border border-primary/40 bg-primary/10"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <filter.icon className={cn("relative h-4 w-4", selected && "text-primary")} aria-hidden />
                  <span className="relative whitespace-nowrap">{filter.label}</span>
                  <span className="relative font-mono text-xs text-muted-foreground">{filter.count}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Article grid */}
        <p className="sr-only" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "topic" : "topics"} shown
        </p>
        <LayoutGroup>
          <motion.ul layout className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((item) => {
                const { article } = item;
                const kind = article ? fileKind(article) : null;
                return (
                  <motion.li
                    key={item.key}
                    layout
                    initial={{ opacity: 0, scale: 0.94, y: 16 }}
                    animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3, layout: { type: "spring", stiffness: 300, damping: 30 } }}
                  >
                    <motion.div
                      whileHover={{ y: -6 }}
                      className="glass-card group flex h-full flex-col rounded-2xl p-5 transition-colors duration-300 hover:border-primary/50 sm:p-6"
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-primary">
                          <item.category.icon className="h-3.5 w-3.5" aria-hidden />
                          {item.category.label}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem]",
                            article
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border bg-secondary/60 text-muted-foreground",
                          )}
                        >
                          {article ? "Published" : "Planned"}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {item.title}
                      </h3>
                      {article && (
                        <>
                          {article.summary && (
                            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{article.summary}</p>
                          )}
                          <p className="mt-3 font-mono text-xs text-muted-foreground">{articleDate(article)}</p>
                        </>
                      )}
                      <div className="flex-1" />
                      {article && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {article.fileUrl && (
                            <a
                              href={article.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              {...(kind === "PDF" ? {} : { download: article.fileName ?? true })}
                              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              {kind === "PDF" ? <FileText className="h-4 w-4" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />}
                              {kind === "PDF" ? "Read PDF" : `Download ${kind}`}
                            </a>
                          )}
                          {article.scholarUrl && (
                            <a
                              href={article.scholarUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <GraduationCap className="h-4 w-4" aria-hidden /> Google Scholar
                            </a>
                          )}
                          {article.zenodoUrl && (
                            <a
                              href={article.zenodoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <BookOpen className="h-4 w-4" aria-hidden /> Zenodo
                            </a>
                          )}
                        </div>
                      )}
                    </motion.div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </motion.ul>
        </LayoutGroup>

        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No topics match "{query}". Try another keyword or track.
          </p>
        )}

        {filtered.length > INITIAL_VISIBLE && (
          <div className="mt-8 flex justify-center">
            <motion.button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full border border-border bg-secondary/60 px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {showAll ? "Show fewer" : `Show all ${filtered.length} topics`}
            </motion.button>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="glass-card mx-auto mt-10 max-w-3xl rounded-2xl p-5 text-center sm:p-6 md:mt-14"
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            Every article is based on real experience, practical experiments, or clearly labelled research. Personal
            projects are kept distinct from professional work, confidential details stay private, and planned topics
            are never presented as finished work.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {site.scholarUrl && (
              <a
                href={site.scholarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                <GraduationCap className="h-4 w-4" aria-hidden /> All my papers on Google Scholar
              </a>
            )}
            <Link to="/#contact" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              Want a topic written first? Let me know <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Articles = ({ variant = "preview" }: { variant?: "preview" | "full" }) =>
  variant === "full" ? <ArticlesFull /> : <ArticlesPreview />;

export default Articles;
