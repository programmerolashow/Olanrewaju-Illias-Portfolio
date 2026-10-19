export interface CaseStudy {
  /** What problem the project solves, and for whom. */
  problem?: string;
  /** What you personally did on it. */
  role?: string;
  /** What was hard, and what it taught you. */
  challenges?: { title: string; detail: string }[];
  /** Feature areas with an honest status each. Only list what you've confirmed. */
  features?: { name: string; status: "Implemented" | "In Progress" | "Prototype" | "Planned" }[];
  /** Real outcomes only: users, numbers, feedback, what you learned. */
  outcome?: string;
  /** How a request moves through the system, in order, e.g. ["Next.js UI", "API route", "Prisma", "PostgreSQL (Neon)"]. */
  architecture?: string[];
  /** Key technical decisions: what was chosen, over what, and why. */
  decisions?: Decision[];
  /** Milestones in order, e.g. { label: "MVP deployed", date: "Mar 2026" }. */
  timeline?: { label: string; date?: string }[];
  /** Short, public, sanitised code excerpts. Mark simplified or pseudocode samples in the note. */
  code?: CodeSample[];
  /** Possible next steps. Shown as potential improvements, not as gaps. */
  improvements?: string[];
}

export interface Decision {
  decision: string;
  alternatives?: string;
  why: string;
  tradeOff?: string;
}

export interface CodeSample {
  title: string;
  language: string;
  code: string;
  /** e.g. "Simplified from src/lib/paystack.ts". */
  note?: string;
  /** Link to the real file on GitHub. */
  source?: string;
}

export interface Project {
  /** URL segment for /projects/:slug. */
  slug: string;
  title: string;
  description: string;
  tags: string[];
  github: string;
  live?: string;
  featured: boolean;
  /** Optional screenshot in /public/projects. imageFocus = CSS object-position. */
  image?: string;
  imageFocus?: string;
  /** e.g. "Fintech / Full-Stack Web Application". */
  category?: string;
  /** "Live", "Prototype", "In progress" or "Archived". Shown as a label so visitors know how finished it is. */
  status?: string;
  /** Optional write-up shown on the project page. Sections left empty are not rendered. */
  caseStudy?: CaseStudy;
}

export const projects: Project[] = [
  {
    slug: "bankspace",
    title: "BankSpace",
    description:
      "BankSpace is a fintech application project focused on bringing banking-related workflows, financial visibility, and account management into a unified digital experience.",
    tags: ["Next.js", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "Neon", "Vercel"],
    category: "Fintech / Full-Stack Web Application",
    github: "https://github.com/programmerolashow/BankSpace",
    live: "https://bank-space-mu95.vercel.app/",
    featured: true,
    image: "/projects/bankspace.webp",
    imageFocus: "80% center",
    // status, features and timeline stay unset until confirmed against the BankSpace repo.
    caseStudy: {
      problem:
        "Financial applications need to present account information and transaction activity clearly while maintaining consistent data, secure access, and dependable workflows. BankSpace explores how these concerns can be addressed through a unified application architecture, a structured database layer, and carefully integrated financial services.",
      role: "Full-Stack Product Engineer and Project Developer. My work on BankSpace has included full-stack application development and technical implementation across the application's architecture.",
      architecture: ["Browser / User Interface", "Next.js Application", "Server-Side Application Logic", "Prisma ORM", "Neon PostgreSQL"],
      decisions: [
        {
          decision: "Next.js with TypeScript",
          why: "This combination supports a structured web application with typed application code and integrated frontend and server-side capabilities.",
          tradeOff: "The framework introduces its own routing and rendering conventions, and TypeScript requires appropriate type definitions and ongoing maintenance.",
        },
        {
          decision: "Prisma as the database access layer",
          why: "Prisma provides a schema-driven approach to data modelling and typed database queries, helping developers work with application data more consistently.",
          tradeOff: "The application must manage schema changes, migrations, client generation, and ORM-specific constraints appropriately.",
        },
        {
          decision: "PostgreSQL as the relational database, hosted through Neon",
          why: "A relational database is suitable for structured financial application data and relationships between users, accounts, and transaction records.",
          tradeOff: "The application still needs deliberate data modelling, transaction handling, access controls, and appropriate database configuration. Choosing a relational database does not by itself guarantee financial correctness.",
        },
        {
          decision: "Vercel as the deployment platform",
          why: "Vercel supports deploying Next.js applications and integrating deployments with a modern development workflow.",
          tradeOff: "Deployment architecture, runtime constraints, environment configuration, and database connectivity must be handled according to the application's actual requirements.",
        },
      ],
      challenges: [
        {
          title: "Maintaining a clear application architecture",
          detail: "A full-stack financial application needs clear boundaries between its user interface, server-side logic, and data access. Organizing these responsibilities makes the codebase easier to reason about and maintain.",
        },
        {
          title: "Working with typed data access",
          detail: "Using TypeScript and Prisma encourages explicit data models and clearer contracts between application code and the database. Types and generated clients still need to be complemented by runtime validation and appropriate error handling.",
        },
        {
          title: "Planning financial workflows carefully",
          detail: "Financial workflows require more than displaying balances and transaction records. They also require careful consideration of transaction state, duplicate operations, data consistency, authorization, and auditability.",
        },
        {
          title: "Integrating external services",
          detail: "External financial services introduce dependencies such as authentication credentials, provider availability, API contracts, and asynchronous responses. These integrations need explicit error handling and appropriate verification.",
        },
        {
          title: "Validating the implementation",
          detail: "Build checks, TypeScript validation, linting, and relevant tests help identify implementation problems before changes are delivered. Passing these checks is useful evidence of code quality, but it does not independently establish production readiness or financial correctness.",
        },
      ],
      improvements: [
        "Comprehensive automated testing.",
        "More robust transaction-state management.",
        "Idempotency for applicable financial operations.",
        "Stronger auditability and operational logging.",
        "Additional security testing.",
        "Improved error handling and recovery.",
        "Better performance monitoring.",
        "Clearer user feedback for failed or pending operations.",
        "Improved accessibility and responsive behaviour.",
        "Additional documentation and deployment safeguards.",
      ],
    },
  },
  {
    slug: "e-masscom",
    title: "E-MassCom",
    description:
      "E-MassCom is an AI-powered email client and platform designed to make email management smarter and faster. It features intelligent email composition, automated workflows, audience segmentation, real-time analytics, and seamless integrations with Gmail and Outlook.",
    tags: ["Next.js", "Prisma", "PostgreSQL", "TypeScript", "Clerk", "OpenAI API", "NeonDB", "shadcn/ui"],
    github: "https://github.com/programmerolashow/EMAIL-Application",
    live: "https://email-application-egc9.vercel.app/",
    featured: true,
    image: "/projects/e-masscom.webp",
    imageFocus: "70% top",
  },
  {
    slug: "student-konnect-hub",
    title: "Student-Konnect-Hub",
    description:
      "Student-Konnect-Hub is a modern web application designed to connect students across higher education institutions worldwide. The platform provides a seamless space for students to network, collaborate, and share knowledge regardless of geographical boundaries.",
    tags: ["React", "TypeScript", "PLpgSQL", "CSS"],
    github: "https://github.com/programmerolashow/student-konnect-hub",
    live: "https://student-konnect-hub.vercel.app/",
    featured: true,
    image: "/projects/student-konnect-hub.webp",
    imageFocus: "65% center",
  },
  {
    slug: "homekit-admin-dashboard",
    title: "HomeKit Admin Dashboard",
    description:
      "An admin dashboard that enables admins to manage users, products, and analytics efficiently. Features include user/product search, dynamic data handling, and responsive design. This project strengthened my skills in scalable React apps, reusable components, TypeScript, and building real-world interactive web applications.",
    tags: ["React", "TypeScript", "Tailwind CSS", "Vite"],
    github: "https://github.com/programmerolashow/HomeKit-Admin-Dashboard",
    live: "https://homekit-admin-dashboard.netlify.app",
    featured: false,
  },
  {
    slug: "vidmage",
    title: "VidMage - Personality Generator",
    description:
      "An intelligent personality analysis and generation platform that leverages advanced AI to interpret facial expressions, body language, and visual style cues from user-provided images. The platform transforms visual data into meaningful personality insights, offering users a unique, interactive, and engaging experience.",
    tags: ["React", "Tailwind CSS", "TypeScript", "Lovable"],
    github: "https://github.com/programmerolashow/VidMage",
    live: "https://vid-mage.vercel.app",
    featured: false,
  },
  {
    slug: "buyit",
    title: "BuyIT",
    description:
      "E-commerce platform that is fully responsive, sleek, and optimized for a smooth user experience. Focused on clean UI, product insights, and converting design ideas into a real interactive shopping platform.",
    tags: ["React", "Tailwind CSS", "TypeScript"],
    github: "https://github.com/programmerolashow/shop-insights-hub",
    live: "https://shop-insights-hub.vercel.app",
    featured: false,
  },
  {
    slug: "fraudguard",
    title: "FraudGuard – Receipt Verification & Fraud Detection System",
    description:
      "FraudGuard is an intelligent receipt verification and fraud detection system built with Python, designed to detect anomalies and validate transactional receipts with high accuracy. It leverages rule-based logic and data validation techniques to identify suspicious patterns, reduce fraudulent submissions, and improve trust in digital transaction workflows.",
    tags: ["Python", "Data Validation", "Fraud Detection", "Automation"],
    github: "https://github.com/programmerolashow/Fraud-Check",
    live: "https://fraud-check-2gfd.vercel.app",
    featured: false,
  },
  {
    slug: "stream-central",
    title: "Stream-Central",
    description:
      "A modern web application inspired by Netflix. Allows users to explore movies and TV shows through a clean, responsive, and interactive interface.",
    tags: ["React", "Tailwind CSS", "TypeScript", "Vite"],
    github: "https://github.com/programmerolashow/stream-central",
    live: "https://stream-central-three.vercel.app/",
    featured: false,
  },
  {
    slug: "backend-user-authentication",
    title: "Backend User Authentication",
    description:
      "Implemented a fully functional CRUD system enabling data to be created, retrieved, updated, and deleted efficiently. Developed an authentication system with user registration, login, and logout features, ensuring secure access and user management.",
    tags: ["JavaScript", "Node.js", "MongoDB", "Postman"],
    github: "https://github.com/programmerolashow/Backend-Tutorial",
    featured: false,
  },
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
