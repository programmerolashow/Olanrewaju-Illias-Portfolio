import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, GitFork, Github, Lock, Star } from "lucide-react";

const OWNER = "programmerolashow";

interface PinnedRepo {
  repo: string;
  title: string;
  /** Shown until (or if) the GitHub API answers. */
  description: string;
  /** /projects/:slug, when the repo has a project page. */
  slug?: string;
}

/** Repos to show, in order. Live stats come from the public GitHub API; a private repo shows without a link. */
const pinned: PinnedRepo[] = [
  {
    repo: "ZoomTrans",
    title: "ZoomTrans",
    description: "Transit payments for passengers, drivers and operators: Expo mobile app, FastAPI backend and QR-based driver workflows.",
  },
  {
    repo: "BankSpace",
    title: "BankSpace",
    description: "Fintech web app for banking workflows, financial visibility and account management.",
    slug: "bankspace",
  },
  {
    repo: "EMAIL-Application",
    title: "E-MassCom",
    description: "AI-powered email client with summaries, reply drafting and action-item extraction.",
    slug: "e-masscom",
  },
];

interface RepoStats {
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  html_url: string;
}

const fetchRepo = async (repo: string): Promise<RepoStats | null> => {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${repo}`);
  if (res.status === 404) return null; // private or renamed
  if (!res.ok) throw new Error(`GitHub request failed (${res.status})`);
  return res.json();
};

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const updatedAgo = (iso: string) => {
  const days = Math.round((Date.parse(iso) - Date.now()) / 86_400_000);
  if (days > -1) return "today";
  if (days > -30) return relative.format(days, "day");
  if (days > -365) return relative.format(Math.round(days / 30), "month");
  return relative.format(Math.round(days / 365), "year");
};

const RepoCard = ({ pin, index, inView }: { pin: PinnedRepo; index: number; inView: boolean }) => {
  const { data, isSuccess } = useQuery({
    queryKey: ["github-repo", pin.repo],
    queryFn: () => fetchRepo(pin.repo),
    staleTime: 60 * 60_000,
    retry: 1,
  });
  const isPrivate = isSuccess && data === null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className="glass-card flex h-full flex-col rounded-2xl p-5"
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="inline-flex min-w-0 items-center gap-2 font-mono text-xs text-muted-foreground">
          <Github className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">
            {OWNER}/{pin.repo}
          </span>
        </p>
        {isPrivate && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
            <Lock className="h-3 w-3" aria-hidden /> Private
          </span>
        )}
      </div>

      <h4 className="text-lg font-bold text-foreground">{pin.title}</h4>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">{data?.description || pin.description}</p>

      {data && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
          {data.language && <span className="text-primary">{data.language}</span>}
          <span className="inline-flex items-center gap-1">
            <Star className="h-3.5 w-3.5" aria-hidden /> {data.stargazers_count}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork className="h-3.5 w-3.5" aria-hidden /> {data.forks_count}
          </span>
          <span>Updated {updatedAgo(data.pushed_at)}</span>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {data && (
          <a
            href={data.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Repository <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        )}
        {pin.slug && (
          <Link
            to={`/projects/${pin.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
          >
            Case study
          </Link>
        )}
      </div>
    </motion.article>
  );
};

/** "On GitHub" strip under the projects: a few hand-picked repos with live stars, language and last push. */
const GitHubStrip = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="mt-14 md:mt-20">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-wrap items-end justify-between gap-3 md:mb-8"
      >
        <h3 className="text-xl font-bold sm:text-2xl">Recently on GitHub</h3>
        <a
          href={`https://github.com/${OWNER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
        >
          All repositories <ArrowUpRight className="h-4 w-4" aria-hidden />
        </a>
      </motion.div>
      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        {pinned.map((pin, index) => (
          <RepoCard key={pin.repo} pin={pin} index={index} inView={isInView} />
        ))}
      </div>
    </div>
  );
};

export default GitHubStrip;
