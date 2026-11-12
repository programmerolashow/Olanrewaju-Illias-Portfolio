import { useState, type ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Copy, ExternalLink, Github } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ScrollSection from "@/components/ScrollSection";
import MotionImage from "@/components/MotionImage";
import ExploreMore from "@/components/ExploreMore";
import SkillIcon from "@/components/SkillIcon";
import { getProject, projects, type CaseStudy, type CodeSample, type SubProduct } from "@/data/projects";
import { usePageMeta } from "@/hooks/use-page-meta";
import { cn } from "@/lib/utils";

const TopSection = ({ heading, children }: { heading: string; children: ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-foreground sm:text-2xl">{heading}</h2>
    {children}
  </section>
);

const SubSection = ({ heading, children }: { heading: string; children: ReactNode }) => (
  <section className="space-y-3">
    <h4 className="text-lg font-bold text-foreground sm:text-xl">{heading}</h4>
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

/** Every filled-in part of a write-up, in reading order. `nested` drops the headings one level (product sections). */
const CaseStudySections = ({ cs, nested = false }: { cs: CaseStudy; nested?: boolean }) => {
  const Section = nested ? SubSection : TopSection;
  const ItemHeading = nested ? "h5" : "h3";
  return (
    <>
      {cs.metrics && cs.metrics.length > 0 && (
        <section aria-label="Results">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cs.metrics.map((m) => (
              <div key={m.label} className="flex flex-col rounded-2xl border border-border p-4 sm:p-5">
                {/* dt must come first in the markup; order-* shows the number on top. */}
                <dt className="order-2 mt-1 text-sm text-foreground/90">{m.label}</dt>
                <dd className="order-1 text-2xl font-bold text-primary sm:text-3xl">{m.value}</dd>
                {(m.asOf || m.source) && (
                  <dd className="order-3 mt-1 font-mono text-xs text-muted-foreground">{[m.asOf, m.source].filter(Boolean).join(" · ")}</dd>
                )}
              </div>
            ))}
          </dl>
        </section>
      )}
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
                <ItemHeading className="font-semibold text-foreground">{c.title}</ItemHeading>
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
                {i < cs.architecture.length - 1 && <ChevronRight className="h-4 w-4 text-primary" aria-hidden />}
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
                <ItemHeading className="font-semibold text-foreground">{d.decision}</ItemHeading>
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
    </>
  );
};

/** Whether a write-up has anything to show. */
const hasContent = (cs: CaseStudy) =>
  Boolean(
    cs.metrics?.length || cs.problem || cs.role || cs.challenges?.length || cs.features?.length || cs.outcome || cs.architecture?.length || cs.decisions?.length || cs.timeline?.length || cs.code?.length || cs.improvements?.length,
  );

const Tags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-wrap gap-2">
    {tags.map((tag) => (
      <span key={tag} className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 font-mono text-xs text-primary sm:text-sm">
        <SkillIcon name={tag} />
        {tag}
      </span>
    ))}
  </div>
);

/** A product inside a project (e.g. Qore Catalog inside Qorelly), with its own anchor so it can be linked to. */
const ProductSection = ({ product }: { product: SubProduct }) => (
  <article id={product.slug} className="scroll-mt-28 space-y-6 rounded-2xl border border-border p-5 sm:p-6">
    <header className="space-y-3">
      <h3 className="text-xl font-bold text-foreground sm:text-2xl">{product.title}</h3>
      {(product.category || product.status) && (
        <div className="flex flex-wrap gap-2">
          {product.category && (
            <p className="rounded-full border border-border bg-secondary/60 px-3 py-1 font-mono text-xs text-muted-foreground">{product.category}</p>
          )}
          {product.status && (
            <p className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono text-xs text-primary">Status: {product.status}</p>
          )}
        </div>
      )}
      <p className="text-muted-foreground md:text-lg">{product.description}</p>
      {product.tags.length > 0 && <Tags tags={product.tags} />}
      {product.live && (
        <a
          href={product.live}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Visit {product.title}
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      )}
    </header>
    {product.image && (
      <div className="overflow-hidden rounded-xl border border-border">
        <MotionImage src={product.image} alt={`${product.title} screenshot`} imgStyle={{ objectPosition: product.imageFocus }} className="aspect-[16/9]" />
      </div>
    )}
    {product.caseStudy && <CaseStudySections cs={product.caseStudy} nested />}
  </article>
);

const ProjectDetailPage = () => {
  const { slug = "" } = useParams();
  const project = getProject(slug);
  usePageMeta(project?.title, project?.description);

  if (!project) return <Navigate to="/projects" replace />;

  const index = projects.indexOf(project);
  const prev = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];
  const cs = project.caseStudy ?? {};
  const hasCaseStudy = hasContent(cs) || Boolean(project.products?.length);

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
          {project.github && (
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
          )}
        </div>
      </PageHeader>

      <div className="container mx-auto px-4 pb-12 sm:px-6 md:pb-16">
        {project.video ? (
          <ScrollSection>
            <div className="mb-10 overflow-hidden rounded-2xl border border-border bg-black md:mb-14">
              <video
                src={project.video}
                poster={project.image}
                controls
                playsInline
                preload="metadata"
                aria-label={`${project.title} video`}
                className="aspect-[16/9] w-full"
              />
            </div>
          </ScrollSection>
        ) : project.image && (
          <ScrollSection>
            <div className="mb-10 overflow-hidden rounded-2xl border border-border md:mb-14">
              <MotionImage
                src={project.image}
                alt={`${project.title} screenshot`}
                loading="eager"
                imgStyle={{ objectPosition: project.imageFocus }}
                className="aspect-[16/9]"
              />
            </div>
          </ScrollSection>
        )}

        <div className="grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div className="max-w-3xl space-y-10">
            <CaseStudySections cs={cs} />
            {project.products && project.products.length > 0 && (
              <TopSection heading={`Products in ${project.title}`}>
                <div className="space-y-6">
                  {project.products.map((product) => (
                    <ProductSection key={product.slug} product={product} />
                  ))}
                </div>
              </TopSection>
            )}
            {!hasCaseStudy && (
              <p className="text-muted-foreground md:text-lg">
                Try the live demo or browse the source code to see how it's built.
              </p>
            )}
          </div>

          <aside className="glass-card h-fit space-y-6 rounded-2xl p-5 sm:p-6">
            <div>
              <h2 className="mb-3 font-mono text-sm text-primary">Tech stack</h2>
              <Tags tags={project.tags} />
            </div>
            {project.products && project.products.length > 0 && (
              <nav aria-label={`Products in ${project.title}`}>
                <h2 className="mb-3 font-mono text-sm text-primary">Products</h2>
                <ul className="space-y-1.5">
                  {project.products.map((product) => (
                    <li key={product.slug}>
                      <a href={`#${product.slug}`} className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary">
                        <ChevronRight className="h-3.5 w-3.5 text-primary" aria-hidden />
                        {product.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
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
