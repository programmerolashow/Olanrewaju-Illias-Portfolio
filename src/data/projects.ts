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
          title: "Financial workflows with a clear user experience",
          detail: "The biggest challenge was handling financial workflows while keeping the experience clear and intuitive. That meant thinking carefully about how data flows between the interface and the backend, how transactions and account information are represented, and how errors are handled. I structured the application around clear responsibilities and reliable API interactions, with maintainability and future expansion in mind.",
        },
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
      "E-MassCom is an AI-powered email client and platform designed to make email management smarter and faster. It connects to an existing mailbox and adds AI summaries, reply drafting, draft rewriting and action-item extraction.",
    tags: ["Next.js", "TypeScript", "tRPC", "Prisma", "PostgreSQL", "Supabase Auth", "Nylas", "OpenAI API", "shadcn/ui"],
    category: "AI / Full-Stack Web Application",
    github: "https://github.com/programmerolashow/EMAIL-Application",
    live: "https://email-application-egc9.vercel.app/",
    featured: true,
    image: "/projects/e-masscom.webp",
    imageFocus: "70% top",
    // Features and decisions are taken from the EMAIL-Application repo.
    caseStudy: {
      problem:
        "Email takes a lot of time to read, triage and answer. E-MassCom is an AI-powered email client that connects to an existing mailbox and adds summaries, reply drafting and action-item extraction on top of a normal inbox.",
      role: "I built E-MassCom independently, from the frontend to the backend: the inbox interface, the typed API layer, the mailbox integration, the database schema and the AI features.",
      challenges: [
        {
          title: "Adding AI without adding complexity",
          detail: "The main challenge was bringing AI into an email workflow without making the experience harder to use. Email tasks and AI assistance had to live in one cohesive interface. I focused on connecting the right application components, managing the API interactions, and keeping the experience straightforward, so AI supports everyday email tasks instead of getting in the way.",
        },
      ],
      architecture: ["Next.js UI", "tRPC (protected procedures)", "Service layer", "Nylas (mailbox source of truth)", "Prisma + PostgreSQL (selective cache)", "OpenAI API"],
      features: [
        { name: "Sign-in and per-user protected API", status: "Implemented" },
        { name: "Connect an email account (Nylas OAuth)", status: "Implemented" },
        { name: "Inbox with cursor pagination, thread view and search", status: "Implemented" },
        { name: "Compose, send and draft management", status: "Implemented" },
        { name: "Mark as read and archive", status: "Implemented" },
        { name: "AI thread and email summaries", status: "Implemented" },
        { name: "AI reply generation and draft rewriting", status: "Implemented" },
        { name: "AI action-item extraction and thread intelligence", status: "Implemented" },
        { name: "Ask-AI copilot panel", status: "Implemented" },
        { name: "Idempotent webhook processing", status: "Implemented" },
      ],
      decisions: [
        {
          decision: "Nylas as the mailbox source of truth, with a selective local cache",
          alternatives: "Syncing and storing every message in the app's own database",
          why: "Reads, sends and drafts come live from the provider, so the app never duplicates a whole mailbox. Only active-thread metadata is cached locally for fast AI processing.",
          tradeOff: "Most views depend on the provider being available, and the cache has to be kept in step with it.",
        },
        {
          decision: "A provider abstraction and an email normalizer between Nylas and the app",
          why: "The rest of the code works with one normalized message and thread shape, so the mail provider can change without rewriting the UI or the AI features.",
          tradeOff: "An extra layer to maintain, and provider-specific fields have to be mapped deliberately.",
        },
        {
          decision: "Idempotent webhook handling",
          why: "Webhook providers retry and can deliver the same event twice. Each event is recorded and moved through PROCESSING, PROCESSED or FAILED, so a duplicate is acknowledged without repeating its side effects and a failed event can be retried.",
        },
        {
          decision: "Bounded, sanitized context for every AI call",
          why: "Before an email reaches the model, HTML, scripts, embedded images, long URLs and likely secrets are stripped, and the prompt is capped to the most recent messages and a fixed character budget. This keeps token cost predictable and avoids sending unnecessary content.",
          tradeOff: "Very long threads are summarized from their most recent messages, not the full history.",
        },
        {
          decision: "tRPC with typed, protected procedures",
          why: "Every mail and AI operation is a typed procedure that requires a signed-in user, so the client and server share types end to end.",
        },
      ],
      outcome: "An independently built personal project, fully working end to end. There are no user numbers or production metrics to report.",
      improvements: [
        "Verify Nylas webhook signatures before processing events.",
        "Add automated tests for the mail, AI and webhook services.",
        "Semantic search over cached threads.",
        "Usage limits and cost tracking for AI calls.",
      ],
    },
  },
  {
    slug: "student-konnect-hub",
    title: "Student-Konnect-Hub",
    description:
      "Student-Konnect-Hub is a modern web application designed to connect students across higher education institutions worldwide. The platform provides a seamless space for students to network, collaborate, and share knowledge regardless of geographical boundaries.",
    tags: ["React", "TypeScript", "Supabase", "PostgreSQL", "PLpgSQL", "CSS"],
    category: "Social / Full-Stack Web Application",
    github: "https://github.com/programmerolashow/student-konnect-hub",
    live: "https://student-konnect-hub.vercel.app/",
    featured: true,
    image: "/projects/student-konnect-hub.webp",
    imageFocus: "65% center",
    // Features are taken from the student-konnect-hub repo and its Supabase migrations.
    caseStudy: {
      problem:
        "Students at different institutions rarely have one place to find each other, share what they are learning and stay in touch. Student-Konnect-Hub is a student network built around short videos, connections and direct messaging.",
      role: "I built Student-Konnect-Hub independently, including the React interface, the Supabase database schema and access rules, and the realtime features.",
      challenges: [
        {
          title: "Many interactions, one cohesive platform",
          detail: "The main challenge was bringing many student-focused interactions into one platform. The video feed, messaging, connections and notifications all have to work together while navigation stays intuitive and application state stays consistent. I organised the app into manageable components and connected the frontend and backend workflows, with an emphasis on maintainability and a smooth experience.",
        },
      ],
      architecture: ["React + Vite UI", "Supabase client", "Supabase Auth", "PostgreSQL with row-level security", "Supabase Realtime"],
      features: [
        { name: "Sign-up, sign-in and password reset", status: "Implemented" },
        { name: "Student profiles and a searchable directory", status: "Implemented" },
        { name: "Video upload, feed and player", status: "Implemented" },
        { name: "In-browser video editing: trim, captions and filters", status: "Implemented" },
        { name: "Comments, acknowledgements, view counts and hashtags", status: "Implemented" },
        { name: "Explore page", status: "Implemented" },
        { name: "Connections and followers", status: "Implemented" },
        { name: "Realtime direct messaging", status: "Implemented" },
        { name: "Realtime notifications", status: "Implemented" },
        { name: "Block, mute and report", status: "Implemented" },
        { name: "Light and dark theme", status: "Implemented" },
      ],
      decisions: [
        {
          decision: "Supabase for auth, database and realtime",
          alternatives: "A custom Node.js API with a separate websocket server",
          why: "One platform covers sign-in, PostgreSQL and realtime subscriptions, so messaging, notifications and comments update live without running a separate server.",
          tradeOff: "More of the security model lives in database policies, and the app is tied to Supabase's client and APIs.",
        },
        {
          decision: "Row-level security on the tables",
          why: "Supabase exposes the database to the browser, so access rules are enforced in PostgreSQL itself rather than trusted to the client.",
        },
        {
          decision: "Safety tools from the start",
          why: "A social platform for students needs a way to handle unwanted contact, so blocking, muting and reporting were built in from the start.",
        },
      ],
      outcome: "An independently built personal project, fully working end to end. There are no user numbers or production metrics to report.",
      improvements: ["Broader automated test coverage.", "Moderation tools for handling reports.", "Institution verification for student accounts."],
    },
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
