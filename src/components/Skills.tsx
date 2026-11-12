import { AnimatePresence, motion, useInView, useMotionTemplate, useMotionValue } from "framer-motion";
import { useRef, useState } from "react";
import {
  Bot,
  Braces,
  Briefcase,
  Database,
  Flag,
  GitBranch,
  HeartHandshake,
  Layers,
  LayoutTemplate,
  Lightbulb,
  MessagesSquare,
  Palette,
  Plug,
  Rocket,
  Server,
  ShieldCheck,
  Smartphone,
  Target,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import TypewriterText from "@/components/TypewriterText";
import SkillIcon from "@/components/SkillIcon";
import ColorWaveText from "@/components/ColorWaveText";

interface SkillCategory {
  group: "technical" | "professional";
  id: string;
  label: string;
  icon: LucideIcon;
  blurb: string;
  skills: string[];
}

const categories: SkillCategory[] = [
  {
    group: "technical",
    id: "languages",
    label: "Languages",
    icon: Braces,
    blurb: "The languages I write production code in every day, and the ones I reach for when the job calls for them.",
    skills: [
      "JavaScript (ES6+)",
      "TypeScript",
      "Python",
      "PHP",
      "SQL",
      "HTML5",
      "CSS3",
      "Visual Basic",
    ],
  },
  {
    group: "technical",
    id: "frontend",
    label: "Frontend",
    icon: LayoutTemplate,
    blurb: "Responsive, accessible, component-driven interfaces with thoughtful motion and solid state management.",
    skills: [
      "React.js",
      "React Native",
      "Next.js",
      "Angular",
      "Expo",
      "Vite",
      "Tailwind CSS",
      "Responsive Web Design",
      "Zustand",
      "Radix UI",
      "shadcn/ui",
      "Framer Motion",
      "GSAP",
      "Lucide Icons",
      "Accessibility-Conscious UI",
      "Light & Dark Theming",
      "Forms & Validation",
      "Frontend Performance",
    ],
  },
  {
    group: "technical",
    id: "backend",
    label: "Backend & APIs",
    icon: Server,
    blurb: "Modular services and RESTful APIs with secure auth, validation, clean error handling and third-party integrations.",
    skills: [
      "Node.js",
      "Express.js",
      "Python Django",
      "FastAPI",
      "RESTful API Development",
      "API Integration",
      "API Design",
      "Authentication and Authorization",
      "JWT Authentication",
      "OAuth 2.0",
      "Webhook Integration",
      "Server-side Development",
      "Backend Architecture",
      "Request Validation",
    ],
  },
  {
    group: "technical",
    id: "mobile",
    label: "Mobile",
    icon: Smartphone,
    blurb: "Cross-platform mobile apps with React Native and Expo, from UI and API wiring to builds and store submission.",
    skills: [
      "React Native",
      "Expo",
      "Cross-platform Development",
      "Android Application Development",
      "Mobile UI Development",
      "Mobile API Integration",
      "QR Code Integration",
      "Application Deployment",
      "EAS Build and Submission",
    ],
  },
  {
    group: "technical",
    id: "databases",
    label: "Databases",
    icon: Database,
    blurb: "Relational and NoSQL data modelling, schema evolution, migrations, and modernizing existing data layers.",
    skills: [
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Prisma ORM",
      "SQLAlchemy",
      "Mongoose",
      "Database Design",
      "Database Architecture",
      "Database Schema Design",
      "Database Migration",
      "Relational Database Management",
      "Data Modelling",
      "Query Optimization",
      "Type-safe Database Access",
      "NeonDB",
      "Redis",
      "Alembic",
      "NoSQL Modelling",
      "Data Access Layers",
    ],
  },
  {
    group: "technical",
    id: "ai",
    label: "AI Engineering",
    icon: Bot,
    blurb: "Shipping LLM features into real products: grounded prompts, managed context, validated outputs and safe defaults.",
    skills: [
      "AI Application Development",
      "Large Language Model (LLM) Integration",
      "Generative AI Integration",
      "Prompt Engineering",
      "Context Engineering",
      "AI API Integration",
      "Conversational AI Development",
      "AI-powered Application Development",
      "AI-assisted Software Development",
      "ChatGPT",
      "Claude Code",
      "Google Gemini",
      "System Prompt Design",
      "Conversation State",
      "Prompt-Injection Defence",
      "AI Workflow Validation",
    ],
  },
  {
    group: "technical",
    id: "architecture",
    label: "Software Engineering",
    icon: Layers,
    blurb: "Architecture, refactoring and migrations that keep applications typed, maintainable and ready to scale.",
    skills: [
      "Full-Stack Development",
      "Product Engineering",
      "Software Architecture",
      "System Design",
      "Modular Architecture",
      "Component-based Architecture",
      "Type-safe Development",
      "JavaScript-to-TypeScript Migration",
      "Database Migration",
      "Code Refactoring",
      "Reusable Component Development",
      "Software Debugging",
      "Performance Optimization",
      "Application Maintenance",
      "Error Handling",
      "Scalable Application Development",
      "Secure Application Development",
    ],
  },
  {
    group: "technical",
    id: "devops",
    label: "DevOps & Deployment",
    icon: GitBranch,
    blurb: "Git-based collaboration, CI/CD pipelines and deployments from preview through production.",
    skills: [
      "Git",
      "GitHub",
      "GitLab",
      "GitLab CI/CD",
      "CI/CD Pipeline Development",
      "Automated Testing",
      "Build Automation",
      "Cloudflare Pages",
      "Vercel",
      "Render",
      "Docker",
      "Expo Application Services (EAS)",
      "Environment Configuration",
      "Deployment Management",
      "Version Control",
      "Cloud Deployment",
      "GitLab Runner",
      "Preview Environments",
      "Merge Request Workflows",
      "Postman",
      "npm",
      "pnpm",
      "VS Code",
      "PowerShell",
      "Trello",
    ],
  },
  {
    group: "technical",
    id: "quality",
    label: "Testing & Quality",
    icon: ShieldCheck,
    blurb: "Catching problems before users do: testing, static checks, root-cause debugging and security scanning.",
    skills: [
      "Software Testing",
      "Unit Testing",
      "Integration Testing",
      "Regression Testing",
      "API Testing",
      "Authentication Testing",
      "Debugging",
      "Code Review",
      "Static Code Analysis",
      "ESLint",
      "TypeScript Type Checking",
      "User Acceptance Testing (UAT)",
      "Build Validation",
      "SAST",
      "Secret Scanning",
      "Dependency Scanning",
      "Secure Configuration",
    ],
  },
  {
    group: "technical",
    id: "integrations",
    label: "Integrations",
    icon: Plug,
    blurb: "Auth, payments, email and AI services wired into products through their APIs and webhooks.",
    skills: [
      "Clerk",
      "Svix",
      "Supabase",
      "Stripe",
      "OpenAI APIs",
      "Aurinko",
      "Nylas",
      "Google Sign-In",
      "OAuth Providers",
      "Payment Gateway Integration",
      "Digital Payments",
      "Digital Wallets",
      "External API Integration",
    ],
  },
  {
    group: "technical",
    id: "product-ui",
    label: "Product & UI",
    icon: Palette,
    blurb: "Turning product ideas into polished interfaces: dashboards, admin panels, SaaS and fintech workflows.",
    skills: [
      "UI/UX Implementation",
      "Design System Development",
      "Interactive Interface Development",
      "Dashboard Development",
      "Admin Panel Development",
      "Fintech Interface Development",
      "SaaS Application Development",
      "Workflow Automation",
      "Product Feature Development",
      "Cross-platform User Experience",
      "MVP Development",
      "Feature Ownership",
      "Smart Mobility",
      "Transportation Technology",
    ],
  },
  {
    group: "professional",
    id: "leadership",
    label: "Leadership",
    icon: Flag,
    blurb: "Leading teams and owning outcomes: planning the work, sharing it out and seeing it through.",
    skills: [
      "Technical Leadership",
      "Team Leadership",
      "Team Coordination",
      "Project Management",
      "Task Delegation",
      "Sprint Planning",
      "Agile / Scrum / Kanban",
      "Team Collaboration",
      "Decision-Making",
      "Technical Decision-Making",
      "Conflict Resolution",
      "Accountability",
      "Mentorship",
      "Initiative and Ownership",
    ],
  },
  {
    group: "professional",
    id: "communication",
    label: "Communication",
    icon: MessagesSquare,
    blurb: "Explaining technical work clearly to engineers, stakeholders and audiences, in writing and on stage.",
    skills: [
      "Technical Communication",
      "Written Communication",
      "Verbal Communication",
      "Active Listening",
      "Presentation Skills",
      "Public Speaking",
      "Stakeholder Communication",
      "Cross-functional Communication",
      "Networking",
      "Relationship Building",
      "Knowledge Sharing",
      "Constructive Feedback",
    ],
  },
  {
    group: "professional",
    id: "problem-solving",
    label: "Problem-Solving",
    icon: Lightbulb,
    blurb: "Breaking hard problems down, finding root causes and choosing the right fix.",
    skills: [
      "Critical Thinking",
      "Analytical Thinking",
      "Logical Reasoning",
      "Problem-Solving",
      "Troubleshooting",
      "Root Cause Analysis",
      "Research and Investigation",
      "Strategic Thinking",
      "Attention to Detail",
      "Adaptability",
      "Decision Analysis",
    ],
  },
  {
    group: "professional",
    id: "business",
    label: "Product & Business",
    icon: Briefcase,
    blurb: "Thinking like a product owner: understanding the problem, prioritising, and designing the solution.",
    skills: [
      "Product Thinking",
      "Product Strategy",
      "Requirements Analysis",
      "User-focused Thinking",
      "Business Problem Analysis",
      "Feature Prioritization",
      "Process Improvement",
      "Innovation",
      "Product Research",
      "Technical Documentation",
      "Solution Design",
      "Project Planning",
    ],
  },
  {
    group: "professional",
    id: "effectiveness",
    label: "Personal Effectiveness",
    icon: Target,
    blurb: "How I work: dependable, self-driven and always learning.",
    skills: [
      "Time Management",
      "Self-management",
      "Continuous Learning",
      "Learning Agility",
      "Creativity",
      "Resourcefulness",
      "Resilience",
      "Discipline",
      "Reliability",
      "Flexibility",
      "Independent Working",
      "Working Under Pressure",
      "Attention to Quality",
      "Growth Mindset",
    ],
  },
  {
    group: "professional",
    id: "community",
    label: "Community",
    icon: HeartHandshake,
    blurb: "Giving back to the developer community through events, open source and shared learning.",
    skills: [
      "Developer Community Engagement",
      "Community Building",
      "Event Participation and Coordination",
      "Peer Learning",
      "Open-source Contribution",
      "Open-Source Collaboration",
      "Technical Advocacy",
      "Developer Advocacy",
      "Knowledge Sharing",
      "Collaboration Across Teams",
      "Professional Networking",
    ],
  },
];

const groups = [
  { id: "technical", label: "Technical" },
  { id: "professional", label: "Professional" },
] as const;

/** The skills to lead with, shown above the category explorer. */
const coreStrengths = {
  technical: [
    "Full-Stack Development", "Product Engineering", "React & Next.js", "React Native & Expo", "Node.js & Express", "TypeScript",
    "PostgreSQL & Prisma", "AI/LLM Integration", "REST API Development", "Software Architecture", "Database Engineering",
    "Technical Leadership",
  ],
  interpersonal: [
    "Leadership", "Critical Thinking", "Problem-Solving", "Communication", "Team Collaboration", "Adaptability",
    "Project Ownership", "Continuous Learning",
  ],
};

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
  "Clerk", "Stripe", "NeonDB", "Redis", "Render", "Postman",
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
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border bg-secondary/60 px-3.5 py-1.5 font-mono text-xs text-muted-foreground sm:px-5 sm:py-2 sm:text-sm transition-colors hover:border-primary hover:text-primary"
        >
          <SkillIcon name={item} />
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
              className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[0.7rem] text-primary"
            >
              <SkillIcon name={tool} className="h-3 w-3" />
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
  const [groupId, setGroupId] = useState<SkillCategory["group"]>("technical");
  const shownCategories = categories.filter((c) => c.group === groupId);
  const [activeId, setActiveId] = useState(categories[0].id);
  const active = shownCategories.find((c) => c.id === activeId) ?? shownCategories[0];

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
            <TypewriterText text="The Full-Stack " highlight="Toolkit" />
          </h2>
          <ColorWaveText
            className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg"
            text="Full-Stack Product & AI Engineer with experience building scalable web and mobile applications, designing backend systems, integrating AI capabilities, modernizing application architectures, and developing user-focused digital products. Strong in collaborative engineering, technical problem-solving, product thinking, and taking ideas from concept to implementation."
          />
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

        {/* Core strengths */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mb-10 grid gap-4 md:mb-14 md:gap-6 lg:grid-cols-[2fr_1fr]"
        >
          {(
            [
              ["Core strengths", coreStrengths.technical],
              ["How I work", coreStrengths.interpersonal],
            ] as const
          ).map(([title, items]) => (
            <div key={title} className="glass-card rounded-2xl p-5 sm:p-6">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">{title}</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary sm:text-sm"
                  >
                    <SkillIcon name={item} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Technical / professional switch */}
        <div className="mb-4 flex justify-center md:mb-6">
          <div className="inline-flex rounded-full border border-border bg-secondary/60 p-1" role="group" aria-label="Skill type">
            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                aria-pressed={groupId === g.id}
                onClick={() => {
                  setGroupId(g.id);
                  setActiveId(categories.find((c) => c.group === g.id)?.id ?? categories[0].id);
                }}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors sm:px-5",
                  groupId === g.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

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
            {shownCategories.map((category) => {
              const selected = category.id === active.id;
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
                      className="inline-flex cursor-default items-center gap-1.5 rounded-full border border-border bg-secondary/70 px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary"
                    >
                      <SkillIcon name={skill} className="h-4 w-4" />
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
