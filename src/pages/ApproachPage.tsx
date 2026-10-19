import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ScrollSection from "@/components/ScrollSection";
import ExploreMore from "@/components/ExploreMore";
import { aiPractices, collaboration, debugging, decisionFactors, engagement, principles, workflow } from "@/data/approach";
import { usePageMeta } from "@/hooks/use-page-meta";

const sections = [
  { id: "workflow", label: "Workflow" },
  { id: "debugging", label: "Debugging" },
  { id: "decisions", label: "Decisions" },
  { id: "collaboration", label: "Collaboration" },
  { id: "ai", label: "AI engineering" },
  { id: "clients", label: "Working with clients" },
  { id: "principles", label: "Principles" },
];

const Block = ({ id, eyebrow, title, intro, children }: { id: string; eyebrow: string; title: string; intro?: string; children: ReactNode }) => (
  <ScrollSection>
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-28 py-10 md:py-14">
      <p className="mb-2 font-mono text-sm text-primary">{eyebrow}</p>
      <h2 id={`${id}-heading`} className="text-2xl font-bold text-foreground sm:text-3xl">
        {title}
      </h2>
      {intro && <p className="mt-3 max-w-2xl text-muted-foreground md:text-lg">{intro}</p>}
      <div className="mt-6 md:mt-8">{children}</div>
    </section>
  </ScrollSection>
);

const ApproachPage = () => {
  usePageMeta(
    "How I Work",
    "How Olanrewaju Illias plans, builds, debugs and ships software, approaches AI engineering and works with teams and clients.",
  );

  return (
    <>
      <PageHeader
        eyebrow="How I Work"
        title="How I Build"
        highlight="Software"
        description="The process behind the projects: how I go from a problem to a working, maintainable product, how I debug, make decisions, work with teams and clients, and build AI features responsibly."
      >
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
        <Block id="workflow" eyebrow="01 · Workflow" title="From problem to shipped feature" intro="Every piece of work moves through the same four phases, whether it's a one-day fix or a multi-week feature.">
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflow.map((phase, i) => (
              <li key={phase.title} className="glass-card rounded-2xl p-5">
                <span className="font-mono text-xs text-muted-foreground">Phase {i + 1}</span>
                <h3 className="mt-1 text-lg font-semibold text-primary">{phase.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-foreground/90">
                  {phase.steps.map((step) => (
                    <li key={step} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {step}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Block>

        <Block id="debugging" eyebrow="02 · Debugging" title="How I approach difficult problems" intro="Evidence first, smallest fix second, and a guard so the same bug can't come back.">
          <ol className="grid gap-3 md:grid-cols-2">
            {debugging.map((step, i) => (
              <li key={step.title} className="flex gap-4 rounded-2xl border border-border p-4 sm:p-5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-semibold text-primary">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Block>

        <Block id="decisions" eyebrow="03 · Decisions" title="Technical decision-making" intro="Before choosing a tool or an architecture, I weigh it against these factors and write down why the trade-off was worth it.">
          <ul className="flex flex-wrap gap-2">
            {decisionFactors.map((f) => (
              <li key={f} className="rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1.5 text-sm font-medium text-primary">
                {f}
              </li>
            ))}
          </ul>
        </Block>

        <Block id="collaboration" eyebrow="04 · Collaboration" title="Working in a team">
          <ul className="grid gap-3 sm:grid-cols-2">
            {collaboration.map((c) => (
              <li key={c} className="flex gap-3 rounded-2xl border border-border p-4 text-foreground/90">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                {c}
              </li>
            ))}
          </ul>
        </Block>

        <Block
          id="ai"
          eyebrow="05 · AI engineering"
          title="Building AI features responsibly"
          intro="A model's output is a suggestion to validate, not a decision to trust. These are the practices I apply when AI is part of a product."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {aiPractices.map(({ icon: Icon, title, points }) => (
              <div key={title} className="glass-card rounded-2xl p-5 sm:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground sm:text-base">
                  {points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Block>

        <Block id="clients" eyebrow="06 · Clients" title="Working with clients" intro="Freelance and contract work follows a clear path, so you always know what's being built, when, and what's left.">
          <ol className="relative space-y-4 border-l border-border pl-6">
            {engagement.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="absolute -left-[1.85rem] top-1 flex h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" aria-hidden />
                <h3 className="font-semibold text-foreground">
                  <span className="mr-2 font-mono text-sm text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
                  {step.title}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground sm:text-base">{step.detail}</p>
              </li>
            ))}
          </ol>
          <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} className="mt-8 inline-block">
            <Link
              to="/#contact"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-primary-foreground sm:text-base"
              style={{ background: "var(--gradient-primary)" }}
            >
              Discuss a project
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </Block>

        <Block id="principles" eyebrow="07 · Principles" title="What I hold myself to">
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {principles.map((p, i) => (
              <li key={p} className="glass-card flex gap-3 rounded-2xl p-4 sm:p-5">
                <span className="font-mono text-sm font-semibold text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-foreground/90">{p}</span>
              </li>
            ))}
          </ol>
        </Block>
      </div>

      <ScrollSection>
        <ExploreMore />
      </ScrollSection>
    </>
  );
};

export default ApproachPage;
