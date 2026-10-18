import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
} from "framer-motion";
import { useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Check,
  ChevronDown,
  Compass,
  Database,
  GitBranch,
  Landmark,
  Layers,
  LayoutTemplate,
  Plug,
  Server,
  ShieldCheck,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Service {
  id: string;
  icon: LucideIcon;
  title: string;
  summary: string;
  items: string[];
  tech?: string[];
}

const services: Service[] = [
  {
    id: "full-stack",
    icon: Layers,
    title: "Full-Stack Web Application Development",
    summary: "End-to-end web applications, from responsive interfaces to APIs, databases and auth.",
    items: [
      "End-to-end web application development",
      "Frontend and backend development",
      "Responsive and interactive user interfaces",
      "REST API development and integration",
      "Database design and integration",
      "Authentication and authorization implementation",
      "Admin dashboards and internal business tools",
      "Feature development, maintenance, and enhancement",
      "Scalable and maintainable application architecture",
      "Converting product requirements into functional software",
    ],
    tech: ["JavaScript", "TypeScript", "React.js", "Next.js", "Node.js", "Express.js", "PostgreSQL", "MySQL", "MongoDB", "Prisma"],
  },
  {
    id: "ai",
    icon: Bot,
    title: "AI Integration & AI-Powered Applications",
    summary: "LLM features that fit into real products, with validation, guardrails and sensible fallbacks.",
    items: [
      "Integrating large language models into existing applications",
      "Building AI-powered web application features",
      "OpenAI API and Google Gemini API integration",
      "Prompt engineering and context engineering",
      "AI-assisted content generation and information processing",
      "AI-powered customer support workflows",
      "AI-driven career, resume, and productivity features",
      "Combining deterministic business rules with AI reasoning",
      "AI response validation and error handling",
      "Integrating AI services with frontend, backend, and database systems",
      "Implementing application-level prompt-injection defences",
      "Testing and troubleshooting AI-powered features",
    ],
    tech: ["OpenAI API", "Google Gemini API"],
  },
  {
    id: "api",
    icon: Plug,
    title: "API Development & Third-Party Integrations",
    summary: "RESTful APIs, auth flows, webhooks and payment integrations that are validated and tested.",
    items: [
      "RESTful API design and development",
      "Backend endpoint implementation",
      "Frontend-to-backend integration",
      "Third-party API integration",
      "Authentication and authorization workflows",
      "JWT-based authentication",
      "Google sign-in and email/password authentication",
      "Webhook integration",
      "Payment service integration",
      "API request validation and error handling",
      "API testing and debugging",
      "Integrating external services into existing products",
    ],
    tech: ["REST", "JWT", "Google Sign-In", "Webhooks"],
  },
  {
    id: "database",
    icon: Database,
    title: "Database Design, Migration & Modernization",
    summary: "Schema design, safe migrations and moving legacy data layers to typed, maintainable code.",
    items: [
      "Relational database design",
      "SQL database development",
      "PostgreSQL and MySQL integration",
      "MongoDB data modelling",
      "Prisma ORM implementation",
      "Mongoose-based database integration",
      "Database schema design and evolution",
      "Database migrations",
      "MySQL-to-PostgreSQL migration",
      "Database access layer modernization",
      "JavaScript-to-TypeScript codebase modernization",
      "CRUD operations and data persistence",
      "Database troubleshooting and consistency improvements",
      "Refactoring existing applications for maintainability",
    ],
    tech: ["PostgreSQL", "MySQL", "MongoDB", "Prisma", "Mongoose", "TypeScript"],
  },
  {
    id: "frontend",
    icon: LayoutTemplate,
    title: "Frontend Development & UI Implementation",
    summary: "Accessible, responsive, component-driven interfaces with restrained, purposeful motion.",
    items: [
      "React.js application development",
      "Next.js frontend development",
      "TypeScript-based frontend development",
      "Responsive website implementation",
      "Reusable component development",
      "Interactive dashboard development",
      "Form design and validation",
      "State management with Zustand",
      "Tailwind CSS styling",
      "shadcn/ui and Radix UI implementation",
      "Framer Motion and GSAP animations",
      "Light and dark theme implementation",
      "Accessible and user-friendly interfaces",
      "Frontend bug fixing and performance improvements",
      "Translating UI designs and product requirements into functional interfaces",
    ],
    tech: ["React.js", "Next.js", "TypeScript", "Zustand", "Tailwind CSS", "shadcn/ui", "Radix UI", "Framer Motion", "GSAP"],
  },
  {
    id: "backend",
    icon: Server,
    title: "Backend Development & Business Systems",
    summary: "Modular services, business logic and internal tools in Node.js or Python.",
    items: [
      "Node.js and Express.js backend development",
      "Python backend development with FastAPI and Django",
      "REST API implementation",
      "Business logic development",
      "Database-backed workflows",
      "Internal tools and administrative systems",
      "Authentication and access control",
      "Request validation and error handling",
      "Modular backend architecture",
      "Backend debugging and maintenance",
      "Integration of external services",
      "Building maintainable backend services",
    ],
    tech: ["Node.js", "Express.js", "Python", "FastAPI", "Django"],
  },
  {
    id: "fintech",
    icon: Landmark,
    title: "Fintech & Transaction-Oriented Applications",
    summary: "Transaction workflows, payment integrations and audit-friendly admin tooling.",
    items: [
      "Fintech application feature development",
      "Transaction-related business workflows",
      "Payment and financial service integrations",
      "Database-backed financial operations",
      "Transaction data management",
      "Administrative dashboards",
      "Audit-oriented application features",
      "API integration for financial products",
      "Data validation and consistency",
      "Workflow automation for business operations",
    ],
  },
  {
    id: "maintenance",
    icon: Wrench,
    title: "Software Maintenance, Refactoring & Modernization",
    summary: "Finding root causes, fixing defects and leaving existing codebases easier to work in.",
    items: [
      "Debugging existing applications",
      "Investigating and fixing software defects",
      "Refactoring legacy code",
      "JavaScript-to-TypeScript migration",
      "Database technology migration",
      "Improving application structure and maintainability",
      "Fixing API and integration issues",
      "Enhancing existing features",
      "Improving error handling",
      "Resolving build and type-checking errors",
      "Reviewing code for maintainability",
      "Improving existing development workflows",
    ],
  },
  {
    id: "quality",
    icon: ShieldCheck,
    title: "Testing, Quality Assurance & Code Quality",
    summary: "API, integration and regression testing, plus the static checks that keep teams moving.",
    items: [
      "API testing",
      "Functional testing",
      "Integration testing",
      "Feature validation",
      "Bug identification and reproduction",
      "Debugging frontend and backend issues",
      "TypeScript type checking",
      "Linting and build validation",
      "Regression-oriented testing",
      "Automated test execution",
      "Code review and quality improvement",
      "Testing authentication and application workflows",
      "Validating database persistence",
      "Investigating CI/CD failures",
    ],
  },
  {
    id: "devops",
    icon: GitBranch,
    title: "DevOps, CI/CD & Deployment Support",
    summary: "Branch workflows, pipelines, Docker environments and staging-to-production delivery.",
    items: [
      "Git and GitHub workflow setup",
      "GitLab-based collaboration",
      "Branch and merge request workflows",
      "GitLab CI/CD pipeline configuration",
      "Automated linting, testing, and build checks",
      "Docker-based development environments",
      "Environment configuration",
      "Staging and preview deployment workflows",
      "Production deployment workflow support",
      "Build and pipeline troubleshooting",
      "Dependency and secret-scanning workflow awareness",
      "Improving development and delivery workflows",
    ],
    tech: ["Git", "GitHub", "GitLab CI/CD", "Docker"],
  },
  {
    id: "consulting",
    icon: Compass,
    title: "Technical Consultation & Product Engineering",
    summary: "Turning business problems into feasible plans, architectures and well-scoped tasks.",
    items: [
      "Technical feasibility assessment",
      "Software architecture guidance",
      "Technology stack evaluation",
      "Product feature planning",
      "MVP technical planning",
      "Requirements analysis",
      "Breaking product requirements into development tasks",
      "Database and API design guidance",
      "Evaluating implementation trade-offs",
      "Reviewing existing codebases",
      "Planning application modernization",
      "Translating business problems into technical solutions",
    ],
  },
  {
    id: "docs",
    icon: BookOpen,
    title: "Technical Documentation & Developer Support",
    summary: "Docs that help the next developer: setup, architecture, migrations and handoffs.",
    items: [
      "API documentation",
      "Technical setup guides",
      "Software architecture documentation",
      "Development workflow documentation",
      "Migration documentation",
      "Troubleshooting guides",
      "Feature implementation notes",
      "Codebase onboarding documentation",
      "Technical handoff documentation",
      "Explaining technical decisions and implementation approaches",
    ],
  },
];

const PREVIEW_COUNT = 3;

const ServiceCard = ({
  service,
  index,
  inView,
  expanded,
  onToggle,
}: {
  service: Service;
  index: number;
  inView: boolean;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);
  const spotlight = useMotionTemplate`radial-gradient(340px circle at ${mx}px ${my}px, hsl(var(--primary) / 0.14), transparent 70%)`;
  const panelId = `service-panel-${service.id}`;
  const visibleItems = expanded ? service.items : service.items.slice(0, PREVIEW_COUNT);

  return (
    <motion.article
      id={service.id}
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: inView ? 0.1 + (index % 6) * 0.06 : 0, layout: { type: "spring", stiffness: 260, damping: 30 } }}
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mx.set(e.clientX - rect.left);
        my.set(e.clientY - rect.top);
      }}
      className={cn(
        "glass-card group relative overflow-hidden rounded-2xl transition-colors duration-300 hover:border-primary/50",
        expanded && "border-primary/50 sm:col-span-2 lg:col-span-3",
      )}
    >
      <motion.div
        aria-hidden
        style={{ background: spotlight }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <div className="relative flex h-full flex-col p-5 sm:p-6">
        <motion.div layout="position" className="mb-4 flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
              expanded
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground",
            )}
          >
            <service.icon className="h-5 w-5" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
        </motion.div>

        <motion.h3 layout="position" className="mb-2 text-lg font-semibold leading-snug text-foreground">
          {service.title}
        </motion.h3>
        <motion.p layout="position" className="mb-4 text-sm leading-relaxed text-muted-foreground">
          {service.summary}
        </motion.p>

        <ul
          id={panelId}
          className={cn("mb-5 grid gap-2", expanded && "sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-6")}
        >
          <AnimatePresence initial={false}>
            {visibleItems.map((item, i) => (
              <motion.li
                key={item}
                layout="position"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: i >= PREVIEW_COUNT ? (i - PREVIEW_COUNT) * 0.02 : 0 }}
                className="flex items-start gap-2 text-sm text-foreground/90"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                <span>{item}</span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>

        <AnimatePresence initial={false}>
          {expanded && service.tech && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="mb-5"
            >
              <p className="mb-2 font-mono text-xs text-primary">Technologies</p>
              <div className="flex flex-wrap gap-1.5">
                {service.tech.map((tool) => (
                  <span
                    key={tool}
                    className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[0.7rem] text-primary"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout="position" className="mt-auto">
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-sm"
          >
            {expanded ? "Show less" : `See all ${service.items.length} capabilities`}
            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", expanded && "rotate-180")} aria-hidden />
          </button>
        </motion.div>
      </div>
    </motion.article>
  );
};

/** Services shown on the home page; the rest live on /services. */
const PREVIEW_IDS = ["full-stack", "ai", "api", "database", "fintech", "consulting"];

const ServicePreviewCard = ({ service, index, inView }: { service: Service; index: number; inView: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    animate={inView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.45, delay: 0.1 + index * 0.07 }}
    whileHover={{ y: -6 }}
  >
    <Link
      to={`/services#${service.id}`}
      className="glass-card group flex h-full flex-col rounded-2xl p-5 transition-colors duration-300 hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6"
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <service.icon className="h-5 w-5" aria-hidden />
      </div>
      <h3 className="mb-2 font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
        {service.title}
      </h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">{service.summary}</p>
      <span className="inline-flex items-center gap-1.5 font-mono text-xs text-primary">
        {service.items.length} capabilities
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  </motion.div>
);

const Services = ({ variant = "preview" }: { variant?: "preview" | "full" }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { hash } = useLocation();
  // Deep links such as /services#ai open that service straight away.
  const [expandedId, setExpandedId] = useState<string | null>(() => {
    const id = hash.slice(1);
    return services.some((s) => s.id === id) ? id : null;
  });

  if (variant === "full") {
    return (
      <section aria-label="All services" className="pb-12 md:pb-16" ref={ref}>
        <div className="container mx-auto px-4 sm:px-6">
          <LayoutGroup>
            <div className="grid grid-flow-dense gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
              {services.map((service, index) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  index={index}
                  inView={isInView}
                  expanded={expandedId === service.id}
                  onToggle={() => setExpandedId((id) => (id === service.id ? null : service.id))}
                />
              ))}
            </div>
          </LayoutGroup>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="section-padding relative" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center md:mb-14"
        >
          <p className="mb-4 font-mono text-sm text-primary">What I Offer</p>
          <h2 className="section-heading">
            Services Built Around <span className="gradient-text">Real Problems</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
            Full-stack and AI-powered software, from interfaces to APIs and databases, built to be maintainable and
            reliable.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-3">
          {services
            .filter((service) => PREVIEW_IDS.includes(service.id))
            .map((service, index) => (
              <ServicePreviewCard key={service.id} service={service} index={index} inView={isInView} />
            ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex justify-center md:mt-12"
        >
          <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              Explore all {services.length} services
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
