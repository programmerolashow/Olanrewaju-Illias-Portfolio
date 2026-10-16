import { AnimatePresence, motion, useInView, useMotionTemplate, useMotionValue } from "framer-motion";
import { useRef, useState } from "react";
import {
  Bot,
  Braces,
  Database,
  GitBranch,
  Layers,
  LayoutTemplate,
  Rocket,
  Server,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SkillCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  skills: string[];
}

const categories: SkillCategory[] = [
  {
    id: "languages",
    label: "Languages",
    icon: Braces,
    blurb: "The languages I write production code in every day, and the ones I reach for when the job calls for them.",
    skills: ["TypeScript", "JavaScript (ES6+)", "Python", "SQL", "PHP", "HTML5", "CSS3", "Visual Basic"],
  },
  {
    id: "frontend",
    label: "Frontend",
    icon: LayoutTemplate,
    blurb: "Responsive, accessible, component-driven interfaces with thoughtful motion and solid state management.",
    skills: [
      "React.js",
      "Next.js",
      "Angular",
      "React Native",
      "Expo",
      "Vite",
      "Tailwind CSS",
      "shadcn/ui",
      "Radix UI",
      "Zustand",
      "Framer Motion",
      "GSAP",
      "Responsive & Mobile-First UI",
      "Accessibility-Conscious UI",
      "Light & Dark Theming",
      "Forms & Validation",
      "Interactive Dashboards",
      "Frontend Performance",
    ],
  },
  {
    id: "backend",
    label: "Backend & APIs",
    icon: Server,
    blurb: "Modular services and RESTful APIs with secure auth, validation, clean error handling and third-party integrations.",
    skills: [
      "Node.js",
      "Express.js",
      "Django",
      "FastAPI",
      "RESTful API Design",
      "Authentication & Authorization",
      "JWT",
      "Clerk",
      "Google Sign-In",
      "Stripe",
      "Svix & Webhooks",
      "Request Validation",
      "Error Handling",
      "Modular Architecture",
      "Third-Party Integrations",
    ],
  },
  {
    id: "databases",
    label: "Databases",
    icon: Database,
    blurb: "Relational and NoSQL data modelling, schema evolution, migrations, and modernizing existing data layers.",
    skills: [
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "NeonDB",
      "Prisma ORM",
      "Mongoose",
      "SQLAlchemy",
      "Alembic",
      "Schema Design",
      "Database Migrations",
      "Relational Modelling",
      "NoSQL Modelling",
      "Database Technology Migration",
      "Data Access Layers",
    ],
  },
  {
    id: "ai",
    label: "AI Engineering",
    icon: Bot,
    blurb: "Shipping LLM features into real products: grounded prompts, managed context, validated outputs and safe defaults.",
    skills: [
      "OpenAI API",
      "Google Gemini",
      "Claude",
      "LLM Integration",
      "Prompt Engineering",
      "Context Engineering",
      "System Prompt Design",
      "Conversation State",
      "Prompt-Injection Defence",
      "Deterministic Rules + AI Reasoning",
      "AI Workflow Validation",
      "AI-Assisted Development",
    ],
  },
  {
    id: "devops",
    label: "DevOps & Tooling",
    icon: GitBranch,
    blurb: "Git-based collaboration, CI/CD pipelines and containerized environments from preview through production.",
    skills: [
      "Git",
      "GitHub",
      "GitLab",
      "GitLab CI/CD",
      "GitLab Runner",
      "Docker",
      "Staging & Production Deploys",
      "Preview Environments",
      "Merge Request Workflows",
      "npm",
      "pnpm",
      "VS Code",
      "PowerShell",
      "Trello",
    ],
  },
  {
    id: "quality",
    label: "Quality & Security",
    icon: ShieldCheck,
    blurb: "Catching problems before users do: testing, static checks, root-cause debugging and security scanning.",
    skills: [
      "Automated Testing",
      "API Testing",
      "Integration Testing",
      "Regression Testing",
      "Type Checking",
      "Linting",
      "Build Validation",
      "Root-Cause Analysis",
      "Code Reviews",
      "SAST",
      "Secret Scanning",
      "Dependency Scanning",
      "Secure Configuration",
    ],
  },
  {
    id: "product",
    label: "Product & Leadership",
    icon: Users,
    blurb: "Owning features end to end, translating requirements into shipped software, and lifting the team around me.",
    skills: [
      "Product Engineering",
      "Feature Ownership",
      "MVP Development",
      "Requirements Analysis",
      "System Design",
      "Technical Decision-Making",
      "Agile / Scrum / Kanban",
      "Team Leadership",
      "Technical Communication",
      "Technical Documentation",
      "Stakeholder Communication",
      "Open-Source Collaboration",
      "Developer Advocacy",
    ],
  },
];

const stacks = [
  {
    icon: Layers,
    title: "Full-Stack Product Engineering",
    description: "From React and Next.js frontends to Node/Express APIs, databases and auth: complete features, end to end.",
    tools: ["TypeScript", "React", "Next.js", "Node.js", "REST APIs"],
  },
  {
    icon: Bot,
    title: "AI Application Engineering",
    description: "Integrating LLMs into practical workflows with prompt and context engineering, plus validation that holds up.",
    tools: ["Python", "FastAPI", "OpenAI", "Gemini", "Prompting"],
  },
  {
    icon: Database,
    title: "Database Engineering & Modernization",
    description: "Schema changes, migrations and moving legacy codebases to typed, maintainable data access layers.",
    tools: ["PostgreSQL", "MySQL", "Prisma", "Migrations", "JS → TS"],
  },
  {
    icon: Rocket,
    title: "Engineering Collaboration & Delivery",
    description: "Shipping reliably as part of a team through reviews, testing, CI/CD, Docker and clear technical communication.",
    tools: ["Git", "GitLab CI/CD", "Docker", "Code Review", "Agile"],
  },
];

const marqueeTop = [
  "TypeScript", "React", "Next.js", "Node.js", "Python", "FastAPI", "Django", "PostgreSQL", "Prisma", "MongoDB",
  "Tailwind CSS", "Framer Motion", "GSAP",
];
const marqueeBottom = [
  "OpenAI", "Gemini", "Claude", "Docker", "GitLab CI/CD", "Express.js", "React Native", "Expo", "Zustand", "shadcn/ui",
  "Clerk", "Stripe", "NeonDB",
];

const Marquee = ({ items, reverse = false }: { items: string[]; reverse?: boolean }) => (
  <div className="marquee-mask group flex overflow-hidden">
    <div
      className={cn(
        "flex w-max shrink-0 gap-3 pr-3 group-hover:[animation-play-state:paused]",
        reverse ? "animate-marquee-reverse" : "animate-marquee",
      )}
    >
      {[...items, ...items].map((item, i) => (
        <span
          key={`${item}-${i}`}
          aria-hidden={i >= items.length}
          className="whitespace-nowrap rounded-full border border-border bg-secondary/60 px-3.5 py-1.5 font-mono text-xs text-muted-foreground sm:px-5 sm:py-2 sm:text-sm transition-colors hover:border-primary hover:text-primary"
        >
          {item}
        </span>
      ))}
    </div>
  </div>
);

const StackCard = ({ stack, index, inView }: { stack: (typeof stacks)[number]; index: number; inView: boolean }) => {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${mx}px ${my}px, hsl(var(--primary) / 0.14), transparent 70%)`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.15 + index * 0.1 }}
      whileHover={{ y: -6 }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - rect.left);
        my.set(e.clientY - rect.top);
      }}
      className="glass-card group relative overflow-hidden rounded-2xl p-5 transition-colors sm:p-6 duration-300 hover:border-primary/50"
    >
      <motion.div
        aria-hidden
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <stack.icon className="h-5 w-5" />
        </div>
        <h3 className="mb-2 font-semibold text-foreground">{stack.title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{stack.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {stack.tools.map((tool) => (
            <span
              key={tool}
              className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[0.7rem] text-primary"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeId, setActiveId] = useState(categories[0].id);
  const active = categories.find((c) => c.id === activeId) ?? categories[0];

  return (
    <section id="skills" className="section-padding relative" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center md:mb-14"
        >
          <p className="mb-4 font-mono text-sm text-primary">Skills & Expertise</p>
          <h2 className="section-heading">
            The Full-Stack <span className="gradient-text">Toolkit</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Frontend to backend, data to AI, pipelines to product decisions: the tools and practices I use to ship.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-10 space-y-2.5 md:mb-16 md:space-y-3"
        >
          <Marquee items={marqueeTop} />
          <Marquee items={marqueeBottom} reverse />
        </motion.div>

        {/* Category explorer */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid gap-4 md:gap-6 lg:grid-cols-[15rem_1fr] xl:grid-cols-[17rem_1fr]"
        >
          <div
            role="tablist"
            aria-label="Skill categories"
            className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
          >
            {categories.map((category) => {
              const selected = category.id === activeId;
              return (
                <button
                  key={category.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setActiveId(category.id)}
                  className={cn(
                    "relative flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-colors",
                    selected ? "text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  {selected && (
                    <motion.span
                      layoutId="skills-tab"
                      className="absolute inset-0 rounded-xl border border-primary/40 bg-primary/10"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    />
                  )}
                  <category.icon className={cn("relative h-4 w-4 shrink-0", selected && "text-primary")} />
                  <span className="relative whitespace-nowrap">{category.label}</span>
                  <span className="relative ml-auto hidden font-mono text-xs text-muted-foreground lg:inline">
                    {category.skills.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="glass-card relative min-h-[20rem] overflow-hidden rounded-2xl p-5 sm:p-6 md:p-8" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div className="mb-5 flex items-start gap-3 sm:mb-6 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <active.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground md:text-2xl">{active.label}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground md:text-base">{active.blurb}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-2.5">
                  {active.skills.map((skill, i) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 22, delay: i * 0.025 }}
                      whileHover={{ y: -3, scale: 1.04 }}
                      className="cursor-default rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Signature stacks */}
        <div className="mt-14 md:mt-20">
          <motion.h3
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mb-6 text-center text-xl font-bold sm:text-2xl md:mb-8"
          >
            Where I Add the Most Value
          </motion.h3>
          <div className="grid gap-4 sm:grid-cols-2 md:gap-5 xl:grid-cols-4">
            {stacks.map((stack, index) => (
              <StackCard key={stack.title} stack={stack} index={index} inView={isInView} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;
