import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ExternalLink, Github, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { projects } from "@/data/projects";

const Projects = ({ variant = "preview" }: { variant?: "preview" | "full" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const full = variant === "full";

  return (
    <section
      id={full ? undefined : "projects"}
      aria-label={full ? "All projects" : undefined}
      className={full ? "relative pb-12 md:pb-16" : "section-padding relative"}
      ref={ref}
    >
      <div className="container mx-auto px-4 sm:px-6">
        {!full && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center mb-10 md:mb-16"
          >
            <p className="text-primary font-mono text-sm mb-4">My Work</p>
            <h2 className="section-heading">
              Featured <span className="gradient-text">Projects</span>
            </h2>
          </motion.div>
        )}

        {/* Featured Projects */}
        <div className={cn("grid gap-5 md:gap-8", full && "mb-12 md:mb-16")}>
          {projects
            .filter((p) => p.featured)
            .map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="project-card group"
              >
                {/* Screenshot: banner on top for phones; right-hand backdrop fading in from its left edge on wider screens,
                    so it never sits behind the text (no washed-out "ghost" text in light mode) */}
                {project.image && (
                  <div
                    aria-hidden
                    className="project-shot pointer-events-none relative h-44 overflow-hidden sm:h-56 md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[48%]"
                  >
                    <img
                      src={project.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      style={{ objectPosition: project.imageFocus }}
                      className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                    />
                  </div>
                )}
                <div className={cn("relative p-5 sm:p-8 lg:p-10", project.image && "-mt-10 sm:-mt-12 md:mt-0 md:w-[56%]")}>
                  <div className="mb-4 md:mb-6">
                    <p className="text-primary font-mono text-sm mb-2">Featured Project</p>
                    <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                  </div>

                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-5 md:mb-6 max-w-3xl">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-xs sm:px-3 sm:text-sm font-mono text-primary bg-primary/10 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
                      <Link
                        to={`/projects/${project.slug}`}
                        className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                      >
                        Project Details
                        <ArrowRight className="h-4 w-4" aria-hidden />
                      </Link>
                    </motion.div>
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
                        <ExternalLink className="h-4 w-4" />
                      </motion.a>
                    )}
                    <motion.a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.04, y: -2 }}
                      whileTap={{ scale: 0.96 }}
                      className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-5 py-2.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-primary hover:text-primary"
                    >
                      <Github className="h-4 w-4" />
                      Source Code
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>

        {!full && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-10 flex justify-center md:mt-12"
          >
            <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                View all {projects.length} projects
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </motion.div>
          </motion.div>
        )}

        {full && (
          <>
            {/* Other Projects Grid */}
            <motion.h3
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-xl sm:text-2xl font-bold text-center mb-6 md:mb-8"
            >
              Other Noteworthy Projects
            </motion.h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {projects
                .filter((p) => !p.featured)
                .map((project, index) => (
                  <motion.div
                    key={project.title}
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="glass-card rounded-xl p-5 sm:p-6 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <Folder className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                      <div className="flex gap-3">
                        <a
                          href={project.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label={`${project.title} source code on GitHub`}
                        >
                          <Github size={20} />
                        </a>
                        {project.live && (
                          <a
                            href={project.live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            aria-label={`${project.title} live demo`}
                          >
                            <ExternalLink size={20} />
                          </a>
                        )}
                      </div>
                    </div>

                    <h4 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                      <Link to={`/projects/${project.slug}`} className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {project.title}
                      </Link>
                    </h4>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-mono text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Projects;
