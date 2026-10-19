import type { ReactNode } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ExternalLink, Github } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import ScrollSection from "@/components/ScrollSection";
import ExploreMore from "@/components/ExploreMore";
import { getProject, projects } from "@/data/projects";
import { usePageMeta } from "@/hooks/use-page-meta";

const Section = ({ heading, children }: { heading: string; children: ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-xl font-bold text-foreground sm:text-2xl">{heading}</h2>
    {children}
  </section>
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
  const hasCaseStudy = Boolean(cs.problem || cs.role || cs.challenges?.length || cs.outcome);

  return (
    <>
      <PageHeader
        eyebrow={project.title}
        parent={{ label: "Projects", to: "/projects" }}
        title=""
        highlight={project.title}
        description={project.description}
      >
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
              <Section heading="Challenges">
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground md:text-lg">
                  {cs.challenges.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </Section>
            )}
            {cs.outcome && (
              <Section heading="Outcome">
                <p className="text-muted-foreground md:text-lg">{cs.outcome}</p>
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
