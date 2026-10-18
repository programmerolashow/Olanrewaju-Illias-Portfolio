import { AnimatePresence, LayoutGroup, motion, useInView } from "framer-motion";
import { useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Database,
  FileText,
  GitBranch,
  Landmark,
  Layers,
  Lightbulb,
  NotebookPen,
  Search,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// To publish an article: set status to "published" and add its href. Planned topics never render as links.
type ArticleStatus = "planned" | "published";

interface Article {
  title: string;
  status: ArticleStatus;
  href?: string;
}

interface ArticleCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  articles: Article[];
}

const planned = (titles: string[]): Article[] => titles.map((title) => ({ title, status: "planned" }));

const categories: ArticleCategory[] = [
  {
    id: "full-stack",
    label: "Full-Stack Engineering",
    icon: Layers,
    articles: planned([
      "Building Full-Stack Applications with React, Node.js, and PostgreSQL",
      "Designing Maintainable REST APIs for Modern Web Applications",
      "Connecting Frontend Applications to Backend Services",
      "Structuring TypeScript Projects for Long-Term Maintainability",
      "Common Full-Stack Development Challenges and How to Solve Them",
      "From Feature Requirements to Production-Ready Software",
      "Building Reusable UI Components Without Overcomplicating Your Architecture",
      "Debugging Frontend and Backend Integration Issues",
    ]),
  },
  {
    id: "ai",
    label: "AI Engineering",
    icon: Bot,
    articles: planned([
      "Integrating Large Language Models into Real-World Applications",
      "Prompt Engineering vs. Context Engineering: Understanding the Difference",
      "Combining Deterministic Business Rules with AI Reasoning",
      "Building AI-Powered Customer Support Workflows",
      "Designing More Reliable AI Application Workflows",
      "Handling AI Errors, Invalid Responses, and Unexpected Outputs",
      "Understanding Prompt Injection and Application-Level Defences",
      "Integrating OpenAI and Google Gemini APIs into Web Applications",
      "Moving Beyond AI Demos: Building Useful AI-Powered Products",
      "Lessons from Integrating AI into Existing Software Systems",
    ]),
  },
  {
    id: "database",
    label: "Database & Modernization",
    icon: Database,
    articles: planned([
      "Lessons from Migrating a JavaScript Codebase to TypeScript",
      "Moving from MySQL to PostgreSQL: Technical Considerations and Lessons",
      "Introducing Prisma into a Database-Backed Application",
      "Designing Database Schemas for Maintainable Applications",
      "Planning Safe and Repeatable Database Migrations",
      "Understanding ORM Trade-Offs in Modern Backend Development",
      "Troubleshooting Database Connectivity and Authentication Problems",
      "Maintaining Data Consistency During Application Modernization",
    ]),
  },
  {
    id: "quality",
    label: "Testing & Quality",
    icon: ShieldCheck,
    articles: planned([
      "Debugging Software by Investigating Root Causes",
      "Why Type Checking and Linting Matter in Team Projects",
      "Building Reliable API Integration Tests",
      "Testing Authentication and Authorization Workflows",
      "Making Database Migrations Safer to Run Repeatedly",
      "Improving Code Quality Through Review and Refactoring",
      "Diagnosing Build Failures and CI/CD Pipeline Issues",
      "Turning Repeated Bugs into Better Engineering Practices",
    ]),
  },
  {
    id: "product",
    label: "Product Engineering",
    icon: Lightbulb,
    articles: planned([
      "Building Software Around Real User Problems",
      "How to Turn an Idea into a Practical MVP",
      "Balancing Product Requirements with Engineering Constraints",
      "What I Learned from Leading a Student-Focused Technology Initiative",
      "Designing Technology Solutions for Transportation Challenges",
      "Lessons from Collaborating Across Engineering Teams",
      "Building Portfolio Projects That Demonstrate Engineering Ability",
      "Communicating Technical Decisions to Non-Technical Stakeholders",
      "From Product Concept to Technical Architecture",
      "Measuring Project Success Beyond Writing Code",
    ]),
  },
  {
    id: "fintech",
    label: "Fintech & Transactions",
    icon: Landmark,
    articles: planned([
      "Designing Reliable Transaction-Oriented Application Workflows",
      "Building Database-Backed Financial Operations",
      "Approaches to Transaction Matching and Discrepancy Detection",
      "Designing Audit Trails for Administrative Workflows",
      "Combining Business Rules, Data Validation, and AI in Financial Systems",
      "Lessons from Building Software for Business-Critical Workflows",
    ]),
  },
  {
    id: "devops",
    label: "DevOps & Collaboration",
    icon: GitBranch,
    articles: planned([
      "Setting Up CI/CD Pipelines for TypeScript Applications",
      "Organizing Git Branches and Merge Requests in Team Projects",
      "Automating Build, Lint, and Test Checks",
      "Managing Environment Variables Across Development and Deployment",
      "Troubleshooting Docker-Based Development Environments",
      "Improving Collaboration Through Better Technical Documentation",
    ]),
  },
  {
    id: "case-studies",
    label: "Case Studies",
    icon: NotebookPen,
    articles: planned([
      "ZoomTrans: Turning a Transportation Problem into a Technology Initiative",
      "RefundOps: Combining Deterministic Refund Rules with AI Reasoning",
      "Database Modernization: Lessons from MySQL, PostgreSQL, and Prisma",
      "TypeScript Migration: Improving Type Safety in an Existing Codebase",
      "Building AI-Powered Features That Solve Practical Problems",
      "Lessons from Team Leadership and Collaborative Software Development",
      "Building and Maintaining Software Across Multiple Services",
      "What I Would Do Differently When Building My Next Product",
    ]),
  },
];

const allArticles = categories.flatMap((category) =>
  category.articles.map((article) => ({ ...article, category })),
);

const INITIAL_VISIBLE = 9;

const publishedCount = allArticles.filter((a) => a.status === "published").length;

const stats = [
  { value: allArticles.length, label: "Topics" },
  { value: categories.length, label: "Tracks" },
  { value: publishedCount, label: "Published" },
];

const StatStrip = ({ inView, delay = 0.15 }: { inView: boolean; delay?: number }) => (
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
          <StatStrip inView={isInView} />

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
                    {category.articles.length} topics
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
              Browse all {allArticles.length} topics
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allArticles.filter(
      (a) => (activeId === "all" || a.category.id === activeId) && (!q || a.title.toLowerCase().includes(q)),
    );
  }, [activeId, query]);

  const visible = showAll ? filtered : filtered.slice(0, INITIAL_VISIBLE);

  // The selected track lives in the URL (?track=ai) so filtered views can be shared and survive a refresh.
  const selectCategory = (id: string) => {
    setSearchParams(id === "all" ? {} : { track: id }, { replace: true, preventScrollReset: true });
    setShowAll(false);
  };

  const filters = [{ id: "all", label: "All topics", icon: FileText, count: allArticles.length }].concat(
    categories.map((c) => ({ id: c.id, label: c.label, icon: c.icon, count: c.articles.length })),
  );

  return (
    <section aria-label="All article topics" className="relative pb-12 md:pb-16" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <StatStrip inView={isInView} delay={0} />

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
              {visible.map((article) => {
                const published = article.status === "published" && article.href;
                const Wrapper = published ? motion.a : motion.div;
                return (
                  <motion.li
                    key={article.title}
                    layout
                    initial={{ opacity: 0, scale: 0.94, y: 16 }}
                    animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.3, layout: { type: "spring", stiffness: 300, damping: 30 } }}
                  >
                    <Wrapper
                      {...(published ? { href: article.href, target: "_blank", rel: "noopener noreferrer" } : {})}
                      whileHover={{ y: -6 }}
                      className={cn(
                        "glass-card group flex h-full flex-col rounded-2xl p-5 transition-colors duration-300 hover:border-primary/50 sm:p-6",
                        published && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      )}
                    >
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-primary">
                          <article.category.icon className="h-3.5 w-3.5" aria-hidden />
                          {article.category.label}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem]",
                            published
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border bg-secondary/60 text-muted-foreground",
                          )}
                        >
                          {published ? "Published" : "Planned"}
                        </span>
                      </div>
                      <h3 className="flex-1 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {article.title}
                      </h3>
                      {published && (
                        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                          Read article <ArrowUpRight className="h-4 w-4" aria-hidden />
                        </span>
                      )}
                    </Wrapper>
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
          <Link
            to="/#contact"
            className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
          >
            Want a topic written first? Let me know <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

const Articles = ({ variant = "preview" }: { variant?: "preview" | "full" }) =>
  variant === "full" ? <ArticlesFull /> : <ArticlesPreview />;

export default Articles;
