import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Bug,
  Check,
  Clock,
  Compass,
  Hammer,
  RotateCcw,
  Sparkles,
  Target,
} from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ScrollSection from "@/components/ScrollSection";
import ExploreMore from "@/components/ExploreMore";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { usePageMeta } from "@/hooks/use-page-meta";
import { pageMeta } from "@/config/pages";
import { cn } from "@/lib/utils";
import {
  afterTwelve,
  afterTwelveIntro,
  afterTwelveOutro,
  allMonths,
  allocationNote,
  directions,
  directionsIntro,
  finalAdvice,
  growingPortfolio,
  learningCycle,
  mistakes,
  mistakesIntro,
  projectPlan,
  projectsIntro,
  quarters,
  resources,
  resourcesIntro,
  roadmapIntro,
  softSkills,
  softSkillsIntro,
  trackerIntro,
  weeklyAllocation,
  weeklyTime,
} from "@/data/roadmap";

const sections = [
  { id: "philosophy", label: "Philosophy" },
  { id: "months", label: "12 months" },
  { id: "weekly", label: "Weekly time" },
  { id: "projects", label: "Projects" },
  { id: "resources", label: "Resources" },
  { id: "soft-skills", label: "Beyond code" },
  { id: "avoid", label: "Avoid" },
  { id: "tracker", label: "Tracker" },
  { id: "after", label: "After 12 months" },
  { id: "next", label: "What's next" },
];

const cycleIcons = [BookOpen, Hammer, Bug, Sparkles];

interface BlockProps {
  id: string;
  n: number;
  title: string;
  intro?: string;
  children: ReactNode;
}

const Block = ({ id, n, title, intro, children }: BlockProps) => (
  <ScrollSection>
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28 py-10 md:py-14">
      <p className="mb-2 font-mono text-sm text-primary">{String(n).padStart(2, "0")}</p>
      <h2 id={`${id}-heading`} className="text-2xl font-bold text-foreground sm:text-3xl">
        {title}
      </h2>
      {intro && <p className="mt-3 max-w-3xl text-muted-foreground md:text-lg">{intro}</p>}
      <div className="mt-6 md:mt-8">{children}</div>
    </section>
  </ScrollSection>
);

/* ---------------------------------------------------------- progress tracker ---------------------------------------------------------- */

const STORAGE_KEY = "roadmap-progress-v1";

const readProgress = (): number[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === "number") : [];
  } catch {
    return [];
  }
};

const writeProgress = (months: number[]) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(months));
  } catch {
    // Storage unavailable (private mode, blocked site data): progress just isn't remembered.
  }
};

const ProgressTracker = () => {
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    setDone(readProgress());
  }, []);

  const update = (next: number[]) => {
    setDone(next);
    writeProgress(next);
  };

  const toggle = (month: number) => update(done.includes(month) ? done.filter((m) => m !== month) : [...done, month]);
  const total = allMonths.length;
  const count = allMonths.filter((m) => done.includes(m.month)).length;
  const percent = Math.round((count / total) * 100);

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">12-month learning progress</p>
          <p className="mt-1 text-4xl font-bold text-foreground sm:text-5xl">
            {percent}
            <span className="text-2xl text-primary">%</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
            {count} of {total} milestones completed
          </p>
        </div>
        <button
          type="button"
          onClick={() => update([])}
          disabled={count === 0}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" aria-hidden />
          Reset progress
        </button>
      </div>

      <div
        className="mt-5 h-2.5 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="Roadmap progress"
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--gradient-primary)" }}
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>

      <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
        {allMonths.map((m) => {
          const checked = done.includes(m.month);
          return (
            <li key={m.month}>
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                  checked ? "border-primary/50 bg-primary/10" : "border-border hover:border-primary/40",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(m.month)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[hsl(var(--primary))]"
                />
                <span className="text-sm">
                  <span className="font-semibold text-foreground">Month {m.month}:</span>{" "}
                  <span className={cn("text-muted-foreground", checked && "line-through decoration-primary/60")}>{m.milestone}</span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

/* -------------------------------------------------------------------- page -------------------------------------------------------------------- */

const RoadmapPage = () => {
  usePageMeta(pageMeta.roadmap.title, pageMeta.roadmap.description);

  return (
    <>
      <PageHeader eyebrow="Roadmap" title="The 12-Month Software Engineering" highlight="Roadmap" description={roadmapIntro.subtitle}>
        <nav aria-label="On this page" className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full border border-border bg-secondary/60 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary sm:text-sm"
            >
              {s.label}
            </a>
          ))}
        </nav>
      </PageHeader>

      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl space-y-4 text-foreground/90 md:text-lg">
          {roadmapIntro.paragraphs.slice(0, 1).map((p) => (
            <p key={p}>{p}</p>
          ))}
          <blockquote className="glass-card rounded-2xl border-l-4 border-l-primary p-5 sm:p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">My biggest advice to anyone starting out</p>
            <p className="mt-2 text-lg font-semibold text-foreground md:text-xl">{roadmapIntro.advice}</p>
          </blockquote>
          {roadmapIntro.paragraphs.slice(1).map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <Block id="philosophy" n={1} title="The learning philosophy">
          <h3 className="mb-4 text-lg font-semibold text-foreground">The learning cycle</h3>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {learningCycle.map((step, i) => {
              const Icon = cycleIcons[i];
              return (
                <li key={step.title} className="glass-card relative rounded-2xl p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="absolute right-5 top-5 font-mono text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  <h4 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
                </li>
              );
            })}
          </ol>

          <h3 className="mb-4 mt-10 text-lg font-semibold text-foreground">Suggested weekly time allocation</h3>
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <div className="flex h-4 overflow-hidden rounded-full" aria-hidden>
              {weeklyAllocation.map((a, i) => (
                <div
                  key={a.label}
                  style={{ width: `${a.percent}%`, opacity: 1 - i * 0.2 }}
                  className={i % 2 ? "bg-accent" : "bg-primary"}
                />
              ))}
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {weeklyAllocation.map((a, i) => (
                <li key={a.label} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                  <span className="flex items-center gap-2.5 text-foreground/90">
                    <span className={cn("h-3 w-3 rounded-full", i % 2 ? "bg-accent" : "bg-primary")} style={{ opacity: 1 - i * 0.2 }} />
                    {a.label}
                  </span>
                  <span className="font-mono font-semibold text-primary">{a.percent}%</span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">{allocationNote}</p>
          </div>
        </Block>

        <Block
          id="months"
          n={2}
          title="Your first 12 months"
          intro="The roadmap is divided into 12 stages. Each month introduces a new set of concepts while giving you something practical to build."
        >
          <div className="space-y-8">
            {quarters.map((q) => (
              <div key={q.range}>
                <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs font-semibold text-primary">{q.range}</span>
                  <h3 className="text-lg font-semibold text-foreground sm:text-xl">{q.title}</h3>
                </div>
                <Accordion type="multiple" className="relative space-y-3 border-l border-border pl-5 sm:pl-6">
                  {q.months.map((m) => (
                    <AccordionItem key={m.month} value={`m${m.month}`} className="glass-card relative rounded-2xl border px-4 sm:px-5">
                      <span
                        aria-hidden
                        className="absolute -left-[1.6rem] top-6 h-3 w-3 rounded-full border-2 border-primary bg-background sm:-left-[1.85rem]"
                      />
                      <AccordionTrigger className="gap-3 py-4 text-left hover:no-underline">
                        <span>
                          <span className="block font-mono text-xs text-muted-foreground">Month {m.month}</span>
                          <span className="text-base font-semibold text-foreground sm:text-lg">{m.title}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-5">
                        <div className="grid gap-5 md:grid-cols-[1.2fr_1fr]">
                          <div>
                            <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground">
                              <BookOpen className="h-4 w-4 text-primary" aria-hidden /> {m.learnLabel ?? "Learn"}
                            </p>
                            <ul className="space-y-1.5 text-sm text-muted-foreground">
                              {m.learn.map((l) => (
                                <li key={l} className="flex gap-2">
                                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                                  {l}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <div className="rounded-xl border border-border p-4">
                              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Hammer className="h-4 w-4 text-accent" aria-hidden /> Build
                              </p>
                              <p className="text-sm text-muted-foreground">{m.build}</p>
                              {m.buildOptions && (
                                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                                  {m.buildOptions.map((o) => (
                                    <li key={o}>{o}</li>
                                  ))}
                                </ul>
                              )}
                              {m.buildNote && <p className="mt-2 text-sm text-muted-foreground">{m.buildNote}</p>}
                            </div>
                            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
                              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Target className="h-4 w-4 text-primary" aria-hidden /> Milestone
                              </p>
                              <p className="text-sm text-foreground/90">{m.milestone}</p>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </Block>

        <Block id="weekly" n={3} title="How to organise your time every week" intro={weeklyTime.intro}>
          <div className="glass-card rounded-2xl p-5 sm:p-6">
            <p className="text-foreground/90">{weeklyTime.routine}</p>
            <p className="mt-4 flex items-center gap-2 font-mono text-sm text-primary">
              <Clock className="h-4 w-4" aria-hidden /> Suggested schedule · {weeklyTime.hoursPerWeek} hours per week
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {weeklyTime.split.map((s) => (
                <li key={s.label} className="rounded-xl border border-border p-4">
                  <p className="text-2xl font-bold text-foreground">{s.hours}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">{weeklyTime.splitNote}</p>
            <p className="mt-4 border-l-2 border-primary pl-4 text-foreground/90">{weeklyTime.lessTime}</p>
          </div>
        </Block>

        <Block id="projects" n={4} title="Projects to build throughout the year" intro={projectsIntro}>
          <div className="glass-card overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="border-b border-border bg-secondary/50 font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">What it teaches</th>
                  </tr>
                </thead>
                <tbody>
                  {projectPlan.map((p) => (
                    <tr key={p.period} className="border-b border-border/60 last:border-0">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-primary">{p.period}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{p.project}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.teaches}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <h3 className="mb-4 mt-10 text-lg font-semibold text-foreground">What a growing project portfolio could look like</h3>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {growingPortfolio.map((p) => (
              <li key={p.project} className="glass-card rounded-2xl p-5">
                <p className="font-semibold text-foreground">{p.project}</p>
                <p className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 font-medium",
                      p.level === "Beginner" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent",
                    )}
                  >
                    {p.level}
                  </span>
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 font-mono text-muted-foreground">{p.when}</span>
                </p>
              </li>
            ))}
          </ul>
        </Block>

        <Block id="resources" n={5} title="Learning resources worth using" intro={resourcesIntro}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {resources.map((r) => (
              <li key={r.name} className="glass-card flex flex-col rounded-2xl p-5">
                <h3 className="font-semibold text-foreground">{r.name}</h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{r.detail}</p>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {r.cta} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </Block>

        <Block id="soft-skills" n={6} title="Skills beyond programming" intro={softSkillsIntro}>
          <dl className="grid gap-3 sm:grid-cols-2">
            {softSkills.map((s) => (
              <div key={s.skill} className="glass-card rounded-2xl p-4 sm:p-5">
                <dt className="font-semibold text-primary">{s.skill}</dt>
                <dd className="mt-1 text-sm text-muted-foreground sm:text-base">{s.practice}</dd>
              </div>
            ))}
          </dl>
        </Block>

        <Block id="avoid" n={7} title="What you should avoid during your first year" intro={mistakesIntro}>
          <ol className="grid gap-3 md:grid-cols-2">
            {mistakes.map((m, i) => (
              <li key={m.title} className="flex gap-3 rounded-2xl border border-border p-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 font-mono text-sm font-semibold text-destructive">
                  {i + 1}
                </span>
                <span>
                  <span className="flex items-center gap-1.5 font-semibold text-foreground">
                    <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden />
                    {m.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{m.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </Block>

        <Block id="tracker" n={8} title="Your first-year progress tracker" intro={trackerIntro}>
          <ProgressTracker />
        </Block>

        <Block id="after" n={9} title="Where should you be after 12 months?" intro={afterTwelveIntro}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {afterTwelve.map((a) => (
              <li key={a} className="flex gap-3 rounded-2xl border border-border p-4 text-foreground/90">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                {a}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl border-l-2 border-primary pl-4 text-foreground/90 md:text-lg">{afterTwelveOutro}</p>
        </Block>

        <Block id="next" n={10} title="What comes after the first year?" intro={directionsIntro}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {directions.map((d) => (
              <li key={d.title} className="glass-card rounded-2xl p-5 sm:p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Compass className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{d.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.detail}</p>
              </li>
            ))}
          </ul>
        </Block>

        <ScrollSection>
          <section aria-labelledby="final-advice-heading" className="pb-16 pt-6 md:pb-24">
            <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-12">
              <h2 id="final-advice-heading" className="text-2xl font-bold text-foreground sm:text-3xl">
                {finalAdvice.title}
              </h2>
              <div className="mt-5 max-w-3xl space-y-4 text-foreground/90 md:text-lg">
                {finalAdvice.paragraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <p className="gradient-text mt-8 text-2xl font-bold sm:text-3xl">{finalAdvice.closing}</p>
            </div>
          </section>
        </ScrollSection>
      </div>

      <ScrollSection>
        <ExploreMore />
      </ScrollSection>
    </>
  );
};

export default RoadmapPage;
