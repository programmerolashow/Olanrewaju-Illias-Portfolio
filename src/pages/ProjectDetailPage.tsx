import { useState, type ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Copy, ExternalLink, Github } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ScrollSection from "@/components/ScrollSection";
import ExploreMore from "@/components/ExploreMore";
import { getProject, projects, type CodeSample } from "@/data/projects";
import { usePageMeta } from "@/hooks/use-page-meta";
import { cn } from "@/lib/utils";

const Section = ({ heading, children }: { heading: string; children: ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-foreground sm:text-2xl">{heading}</h2>
    {children}
  </section>
);

const CodeBlock = ({ sample }: { sample: CodeSample }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sample.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the code is still selectable */
    }
  };

  return (
    <figure className="overflow-hidden rounded-2xl border border-border">
      <figcaption className="flex items-center justify-between gap-3 border-b border-border bg-secondary/60 px-4 py-2.5">
        <span className="min-w-0 truncate text-sm font-medium text-foreground">
          {sample.title} <span className="font-mono text-xs text-muted-foreground">· {sample.language}</span>
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {copied ? "Copied" : "Copy"}
        </button>
      </figcaption>
      <pre className="overflow-x-auto bg-background/60 p-4 text-xs leading-relaxed sm:text-sm">
        <code className="font-mono">{sample.code}</code>
      </pre>
      {(sample.note || sample.source) && (
        <p className="border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          {sample.note}
          {sample.note && sample.source && " · "}
          {sample.source && (
            <a href={sample.source} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
              View source
            </a>
          )}
        </p>
      )}
    </figure>
  );
};

const ProjectDetailPage = () => {
  const { slug = "" } = useParams();
  const project = getProject(slug);
  usePageMeta(project?.title, project?.description);

  if (!project) return <Navigate to="/projects" replace />;

  const index = projects.indexOf(project);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const cs = project.caseStudy ?? {};
  const hasCaseStudy = Boolean(
    cs.problem || cs.role || cs.challenges?.length || cs.features?.length || cs.outcome || cs.architecture?.length || cs.decisions?.length || cs.timeline?.length || cs.code?.length || cs.improvements?.length,
  );

  return (
    <>
      <PageHeader
        eyebrow={project.title}
        parent={{ label: "Projects", to: "/projects" }}
        title=""
        highlight={project.title}
        description={project.description}
      >
        {(project.category || project.status) && (
          <div className="mb-4 flex flex-wrap gap-2">
            {project.category && (
              <p className="rounded-full border border-border bg-secondary/60 px-3 py-1 font-mono text-xs text-muted-foreground">{project.category}</p>
            )}
            {project.status && (
              <p className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">Status: {project.status}</p>
            )}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {project.live && (
            <motion.a
              href={project.live}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              Live Demo
              <ExternalLink className="h-4 w-4" aria-hidden />
            </motion.a>
          )}
          <motion.a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Github className="h-4 w-4" aria-hidden />
            Source Code
          </motion.a>
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 pb-12 sm:px-6 md:pb-16">
        {project.image && (
          <ScrollSection>
            <div className="mb-10 overflow-hidden rounded-2xl border border-border md:mb-14">
              <img
                src={project.image}
                alt={`${project.title} screenshot`}
                decoding="async"
                style={{ objectPosition: project.imageFocus }}
                className="aspect-[16/9] w-full object-cover"
              />
            </div>
          </ScrollSection>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div className="max-w-3xl space-y-10">
            {cs.problem && (
              <Section heading="The problem">
                <p className="text-muted-foreground md:text-lg">{cs.problem}</p>
              </Section>
            )}
            {cs.role && (
              <Section heading="My role">
                <p className="text-muted-foreground md:text-lg">{cs.role}</p>
              </Section>
            )}
            {cs.challenges && cs.challenges.length > 0 && (
              <Section heading="Engineering challenges and lessons">
                <div className="space-y-4">
                  {cs.challenges.map((c) => (
                    <div key={c.title}>
                      <h3 className="font-semibold text-foreground">{c.title}</h3>
                      <p className="mt-1 text-muted-foreground md:text-lg">{c.detail}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}
            {cs.features && cs.features.length > 0 && (
              <Section heading="Feature areas">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {cs.features.map((f) => (
                    <li key={f.name} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-2.5">
                      <span className="text-foreground/90">{f.name}</span>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-0.5 font-mono text-xs",
                          f.status === "Implemented" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-secondary text-muted-foreground",
                        )}
                      >
                        {f.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}
            {cs.architecture && cs.architecture.length > 0 && (
              <Section heading="How it fits together">
                <ol className="flex flex-wrap items-center gap-2">
                  {cs.architecture.map((node, i) => (
                    <li key={node} className="flex items-center gap-2">
                      <span className="rounded-xl border border-border bg-secondary/60 px-3 py-2 text-sm font-medium text-foreground">{node}</span>
                      {i < cs.architecture!.length - 1 && <ChevronRight className="h-4 w-4 text-primary" aria-hidden />}
                    </li>
                  ))}
                </ol>
              </Section>
            )}
            {cs.decisions && cs.decisions.length > 0 && (
              <Section heading="Key technical decisions">
                <div className="space-y-3">
                  {cs.decisions.map((d) => (
                    <div key={d.decision} className="rounded-2xl border border-border p-4 sm:p-5">
                      <h3 className="font-semibold text-foreground">{d.decision}</h3>
                      <dl className="mt-2 space-y-1.5 text-sm text-muted-foreground sm:text-base">
                        {d.alternatives && (
                          <div>
                            <dt className="inline font-medium text-foreground/90">Considered: </dt>
                            <dd className="inline">{d.alternatives}</dd>
                          </div>
                        )}
                        <div>
                          <dt className="inline font-medium text-foreground/90">Why: </dt>
                          <dd className="inline">{d.why}</dd>
                        </div>
                        {d.tradeOff && (
                          <div>
                            <dt className="inline font-medium text-foreground/90">Trade-off: </dt>
                            <dd className="inline">{d.tradeOff}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  ))}
                </div>
              </Section>
            )}
            {cs.code && cs.code.length > 0 && (
              <Section heading="Code highlights">
                <div className="space-y-4">
                  {cs.code.map((sample) => (
                    <CodeBlock key={sample.title} sample={sample} />
                  ))}
                </div>
              </Section>
            )}
            {cs.timeline && cs.timeline.length > 0 && (
              <Section heading="Timeline">
                <ol className="space-y-3 border-l border-border pl-5">
                  {cs.timeline.map((m) => (
                    <li key={m.label} className="relative">
                      <span className="absolute -left-[1.6rem] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" aria-hidden />
                      <span className="font-medium text-foreground">{m.label}</span>
                      {m.date && <span className="ml-2 font-mono text-xs text-muted-foreground">{m.date}</span>}
                    </li>
                  ))}
                </ol>
              </Section>
            )}
            {cs.outcome && (
              <Section heading="Outcome">
                <p className="text-muted-foreground md:text-lg">{cs.outcome}</p>
              </Section>
            )}
            {cs.improvements && cs.improvements.length > 0 && (
              <Section heading="Potential improvements">
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground md:text-lg">
                  {cs.improvements.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </Section>
            )}
            {!hasCaseStudy && (
              <p className="text-muted-foreground md:text-lg">
                Try the live demo or browse the source code to see how it's built.
              </p>
            )}
          </div>

          <aside className="glass-card h-fit rounded-2xl p-5 sm:p-6">
            <h2 className="mb-3 font-mono text-sm text-primary">Tech stack</h2>
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 font-mono text-xs text-primary sm:text-sm">
                  {tag}
                </span>
              ))}
            </div>
          </aside>
        </div>

        <nav aria-label="More projects" className="mt-12 grid gap-3 border-t border-border pt-8 sm:grid-cols-2 md:mt-16">
          <Link
            to={`/projects/${prev.slug}`}
            className="group rounded-2xl border border-border p-4 transition-colors hover:border-primary sm:p-5"
          >
            <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Previous
            </span>
            <span className="mt-1 block font-semibold text-foreground group-hover:text-primary">{prev.title}</span>
          </Link>
          <Link
            to={`/projects/${next.slug}`}
            className="group rounded-2xl border border-border p-4 text-right transition-colors hover:border-primary sm:p-5"
          >
            <span className="flex items-center justify-end gap-1.5 font-mono text-xs text-muted-foreground">
              Next <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </span>
            <span className="mt-1 block font-semibold text-foreground group-hover:text-primary">{next.title}</span>
          </Link>
        </nav>
      </div>

      <ScrollSection>
        <ExploreMore />
      </ScrollSection>
    </>
  );
};

export default ProjectDetailPage;
