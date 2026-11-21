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
  /**
   * Headline numbers shown as a row at the top of the project page, e.g. { value: "1,200+", label: "Active users" }.
   * Only figures you can back up; `asOf` says when it was measured ("Oct 2026"), `source` how ("Umami", "Neon query").
   */
  metrics?: Metric[];
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

export interface Metric {
  value: string;
  label: string;
  asOf?: string;
  source?: string;
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
  /** Public repository. Leave unset for closed-source work (e.g. company products); the Source Code button is hidden. */
  github?: string;
  live?: string;
  featured: boolean;
  /** Optional screenshot in /public/projects. imageFocus = CSS object-position. */
  image?: string;
  /** Optional MP4 in /public/projects, shown with controls at the top of the project page in place of the screenshot. */
  video?: string;
  imageFocus?: string;
  /** e.g. "Fintech / Full-Stack Web Application". */
  category?: string;
  /** "Live", "Prototype", "In progress" or "Archived". Shown as a label so visitors know how finished it is. */
  status?: string;
  /** Optional write-up shown on the project page. Sections left empty are not rendered. */
  caseStudy?: CaseStudy;
  /**
   * Products that live inside this one. They have no card or page of their own: they're shown only on this
   * project's page, each in its own section (linkable as /projects/<slug>#<product slug>).
   */
  products?: SubProduct[];
}

/** A product within a project (see Project.products). Same fields as a project, minus listing-only ones. */
export type SubProduct = Pick<Project, "slug" | "title" | "description" | "tags" | "live" | "image" | "imageFocus" | "category" | "status" | "caseStudy">;

export const projects: Project[] = [
  {
    slug: "qorelly",
    title: "Qorelly",
    description:
      "Qorelly is a multi-vertical SaaS platform for Nigerian small and medium-sized businesses, built by Core Technologies LTD. It brings point of sale, online orders, menus, inventory, invoicing and payments into one dashboard, alongside two companion products: Qore Catalog and Qore Maps.",
    tags: ["SaaS", "PostgreSQL", "Payments", "Point of Sale", "Inventory", "Claude Code"],
    category: "SaaS / Multi-Vertical Business Platform",
    // Company product: closed source, so no github link. status and metrics stay unset until confirmed.
    live: "https://qorelly.com/",
    featured: true,
    image: "/projects/qorelly.webp",
    imageFocus: "center top",
    caseStudy: {
      problem:
        "Small and medium-sized businesses in Nigeria often run sales, orders, stock and payments across separate tools, paper records and chat apps. Qorelly gives them one place to set up their business, take orders in person and online, track inventory, send invoices and see how the day is going, with amounts in Naira.",
      role: "Software Engineer in the Engineering Department at Core Technologies LTD (Aug 2026 – present). I contribute to full-stack engineering across the platform: frontend and backend features, API integration, database work, debugging, code reviews and testing. I built inventory interface improvements, including product variation table columns, inventory pricing and stock-value displays, and category selection across product workflows.",
      features: [
        { name: "Business dashboard: revenue, orders, average ticket, new customers", status: "Implemented" },
        { name: "Guided setup to the first order", status: "Implemented" },
        { name: "Menu builder: categories, dishes, menus and QR code", status: "Implemented" },
        { name: "Online orders", status: "Implemented" },
        { name: "Point of sale", status: "Implemented" },
        { name: "Inventory", status: "Implemented" },
        { name: "Invoicing", status: "Implemented" },
        { name: "Payment setup: online, card terminal, cash register, bank account", status: "Implemented" },
        { name: "Website builder and visitor analytics", status: "Implemented" },
      ],
      decisions: [
        {
          decision: "Revenue is reported from recorded payments, not from order totals",
          why: "An order's total is what was asked for, not what was received. Reading revenue only from payment records keeps dashboards and reports honest when orders are part-paid, refunded or abandoned.",
          tradeOff: "Every report has to join through payment data, and new reports must follow the same rule.",
        },
        {
          decision: "The amount paid on an order is maintained by the database, never written by the client",
          why: "A server-side trigger keeps it in step with the payments recorded against the order, so no screen or integration can set it to a wrong value.",
          tradeOff: "Logic in the database is less visible than application code and needs to be documented and tested.",
        },
        {
          decision: "File-first database migrations, verified on staging before production",
          why: "Every schema change is a reviewed file applied by a migration runner, never a one-off edit in a SQL console, so each environment can be rebuilt and audited.",
          tradeOff: "Small fixes take longer to ship than editing the database directly.",
        },
      ],
    },
    products: [
      {
        slug: "qore-catalog",
        title: "Qore Catalog",
        description:
          "Qore Catalog is a dataset of products sold in Nigerian commerce, available through an API, so businesses and developers can work from consistent product data instead of typing it in by hand.",
        tags: ["API", "Dataset", "PostgreSQL"],
        category: "Data / API Product",
      },
      {
        slug: "qore-maps",
        title: "Qore Maps",
        description: "Qore Maps is Core Technologies' navigation product, part of the same family as Qorelly and Qore Catalog.",
        tags: ["Maps", "Navigation"],
        category: "Navigation",
      },
    ],
  },
  {
    slug: "maiukha",
    title: "Maiukha",
    description:
      "Maiukha is an AI career coach platform built at AidenAI Technologies LLP. It helps students, fresh graduates and professionals with career guidance, résumé analysis, interview practice and profile management, all through personalised, conversational AI.",
    tags: ["React 19", "TypeScript", "Node.js", "PostgreSQL", "Prisma", "Gemini"],
    category: "AI / Career Technology Platform",
    // Company product: closed source, so no github link. status and metrics stay unset until confirmed.
    live: "https://maiukha.com/",
    featured: true,
    image: "/projects/maiukha.webp",
    imageFocus: "left top",
    caseStudy: {
      problem:
        "Career development is often scattered across job boards, résumé tools and generic chatbots, with little that remembers who you are. Maiukha brings career guidance, résumé intelligence, interview preparation, profile management and conversational AI into one experience, combining conversation with persistent user information, career workflows and personalised recommendations so the guidance stays in context.",
      role: "Full-Stack Web Development Intern at AidenAI Technologies LLP (Jul 2026 – present), in a team of three engineers. I worked across frontend engineering, backend integration, authentication and database architecture: building React and TypeScript features, wiring them to backend APIs, helping migrate JavaScript to TypeScript and MySQL to PostgreSQL with Prisma, working on Google and email/password sign-in, improving session security, refining the conversational interface, and debugging, testing and reviewing code in an Agile workflow.",
      features: [
        { name: "AI career coaching conversations", status: "Implemented" },
        { name: "Career profile management", status: "Implemented" },
        { name: "Résumé upload and ATS-focused analysis", status: "Implemented" },
        { name: "AI-assisted interview preparation", status: "Implemented" },
        { name: "Skills and career insights", status: "Implemented" },
        { name: "Persistent conversation history across sessions", status: "Implemented" },
      ],
      challenges: [
        {
          title: "JavaScript to TypeScript migration",
          detail:
            "Moving existing JavaScript to TypeScript meant improving type definitions and resolving compatibility issues while keeping the application's behaviour intact, so the codebase became easier to maintain without regressions.",
        },
        {
          title: "MySQL to PostgreSQL migration",
          detail:
            "Moving the database to PostgreSQL with Prisma ORM required careful handling of existing data models, relationships, queries and the services that depended on them.",
        },
        {
          title: "Authentication security",
          detail:
            "I worked on Google OAuth validation and JWT handling, strengthening token validation and removing insecure fallback behaviour.",
        },
        {
          title: "A conversational experience, not just a chat window",
          detail:
            "The AI interface needed conversation persistence, interaction states, suggestions, Markdown responses and history management, with a consistent experience at every stage of a conversation.",
        },
      ],
      architecture: ["React 19 + Vite UI (Zustand, Radix UI)", "Express.js REST API", "Prisma ORM", "PostgreSQL", "Gemini (via the backend)"],
      outcome:
        "My work helped advance the platform's frontend and backend engineering, authentication, database modernisation and AI experience. One authentication verification milestone ran 9 test files with all 40 tests passing and a successful frontend production build. Development ran through GitLab merge requests, code reviews, Agile/Scrum, staging and production deployments, and user acceptance feedback. It taught me to design AI features around real user workflows, manage complex state and persistent conversations, migrate databases safely in an evolving app, and balance feature work with testing and reliability.",
    },
  },
  {
    slug: "chekueit",
    title: "ChekueIT",
    description:
      "ChekueIT is a security verification platform for checking documents, QR codes and links against phishing, tampering and impersonation. It fingerprints documents against issuer registries, decodes QR codes before anyone opens them, traces links through redirects and threat-intelligence feeds, and exposes the same checks through a developer API that organisations can build into their own applications.",
    tags: ["React 19", "TypeScript", "Node.js", "Express", "Firebase", "Gemini", "Threat Intelligence"],
    category: "Security / Verification Platform",
    live: "https://chekueit.olanrewajuillias.workers.dev/",
    // Private repo, so no github link. status and metrics stay unset until confirmed.
    featured: true,
    image: "/projects/chekueit.webp",
    imageFocus: "left top",
    caseStudy: {
      problem:
        "Forged certificates, edited receipts, QR codes that lead somewhere other than they claim, and phishing links sent by SMS, email or WhatsApp are hard to spot by eye. ChekueIT gives individuals and organisations one place to check a document, a QR code or a link before trusting it, with an evidence-based risk score and a report explaining every finding.",
      features: [
        { name: "Document verification: SHA-256 fingerprint matched against issuer registries, with duplicate-submission checks", status: "Implemented" },
        { name: "AI document forensics: field extraction, inconsistencies and visual editing indicators across up to 3 pages", status: "Implemented" },
        { name: "Embedded QR codes in documents decoded and checked like links (up to 5)", status: "Implemented" },
        { name: "QR scanner: live camera, photo, PDF (pages 1–5) or pasted payload, decoded on the device", status: "Implemented" },
        { name: "Payload detection: links, payment URIs, Wi-Fi credentials, contact cards and plain text", status: "Implemented" },
        { name: "Purpose mismatch: flags QR codes and links whose destination doesn't match what they claim", status: "Implemented" },
        { name: "Link checker: server-side redirect tracing, TLS certificate and domain-age checks, look-alike and risky-TLD heuristics", status: "Implemented" },
        { name: "Login and payment trap detection: password, card, BVN, NIN and OTP fields, and forms posting elsewhere", status: "Implemented" },
        { name: "Threat feeds: URLhaus and OpenPhish, with Google Safe Browsing and VirusTotal when configured", status: "Implemented" },
        { name: "Dashboard with KPIs, risk distribution and 7-day trend charts", status: "Implemented" },
        { name: "Batch verification of up to 10 documents or URLs with a live queue monitor", status: "Implemented" },
        { name: "History with search, filters, CSV export and bulk PDF export as a ZIP", status: "Implemented" },
        { name: "Detailed reports: shareable links, PDF, JSON and print", status: "Implemented" },
        { name: "Organisations: authoritative document hash registry with revoke and restore", status: "Implemented" },
        { name: "Developer API with hashed API keys, so organisations can run verifications from their own applications", status: "Implemented" },
        { name: "Provider health monitoring for every intelligence source", status: "Implemented" },
        { name: "Admin audit log with filters and CSV export", status: "Implemented" },
        { name: "Real-time high-risk alerts, in-app feedback, and light and dark themes", status: "Implemented" },
      ],
      architecture: [
        "React 19 + Vite UI (on-device QR decoding, PDF rendering, SHA-256 hashing)",
        "Express API (helmet, rate limiting)",
        "Forensic engines: Gemini multimodal analysis, redirect tracing, TLS and RDAP checks, threat feeds",
        "Firebase Auth + Cloud Firestore",
      ],
      decisions: [
        {
          decision: "A document is only marked Verified when its fingerprint matches an issuer's registry",
          alternatives: "Trusting AI or visual analysis to declare a document genuine",
          why: "A convincing forgery can look perfect. Verified requires an active match in an organisation's authoritative hash registry and a low risk score; everything else is classed as Unverified, Suspicious or High Risk, so appearance alone never earns a pass.",
          tradeOff: "Genuine documents from issuers who haven't registered their hashes can never reach Verified, only Unverified.",
        },
        {
          decision: "Links are visited from the server, with SSRF protection",
          why: "Following redirects server-side means nothing opens on the user's device. Each hop is checked against private and internal network ranges, redirects are capped at 5 and only the first 64 KB of a page is inspected.",
          tradeOff: "Some sites behave differently for a server than for a phone, so a few cloaked pages may look cleaner than they are.",
        },
        {
          decision: "QR codes are decoded on the user's device",
          why: "Camera frames, photos and PDFs are decoded in the browser, and only the decoded payload is sent for analysis, so the original image never leaves the device.",
        },
        {
          decision: "API keys are stored only as SHA-256 hashes",
          why: "The full key is shown once when it's issued. If the database were exposed, the stored hashes couldn't be used to call the API.",
          tradeOff: "A lost key can't be recovered, only revoked and replaced.",
        },
        {
          decision: "Optional threat-intelligence providers degrade gracefully",
          why: "Each provider reports its own health. When one is unavailable or not configured, verdicts still run and the report says which sources were skipped, rather than failing the whole check.",
        },
      ],
      code: [
        {
          title: "Developer API: verify a link from your own application",
          language: "bash",
          code: `curl -X POST https://chekueit.olanrewajuillias.workers.dev/api/v1/verify \\
  -H "x-api-key: chk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "url": "https://example.com/login" }'`,
          note: "Illustrative request. Keys are issued from the API & integrations page; Authorization: Bearer chk_... is also accepted.",
        },
      ],
    },
  },
  {
    slug: "betalife",
    title: "BetaLife",
    description:
      "BetaLife is a multiplayer 3D open-world university and city life simulation set at the University of Ilorin (UNILORIN) and across metropolitan Ilorin, Kwara State. Players create a character, attend lectures, run side hustles, drive Keke and Okada, furnish a hostel and meet friends in a georeferenced world built from real coordinates and OpenStreetMap roads. Your Campus. Your World. Your Life.",
    tags: ["React 19", "TypeScript", "Three.js", "Node.js", "WebSockets", "OpenStreetMap", "Gemini"],
    category: "Game / 3D Multiplayer Simulation",
    // Private repo, so no github link. No live link yet. status and metrics stay unset until confirmed.
    featured: true,
    image: "/projects/betalife.webp",
    imageFocus: "center top",
    video: "/projects/betalife.mp4",
    caseStudy: {
      problem:
        "Most games are set in places that look nothing like Nigeria. BetaLife puts players in a world they recognise: UNILORIN's permanent site, Tanke, Oke-Odo, Post Office, Challenge and Oja-Oba, laid out from real latitude and longitude, with laterite soil, savanna hills, the Oyun and Asa rivers, Keke Napep in the rain and jollof at Mama Caro's. It turns everyday student life in Ilorin into a shared, playable world.",
      features: [
        { name: "Georeferenced 3D world: real Ilorin coordinates projected onto continuous terrain with district streaming", status: "Implemented" },
        { name: "24 locations across UNILORIN, student communities and metropolitan Ilorin, plus a Greater Kwara expansion roadmap", status: "Implemented" },
        { name: "Live OpenStreetMap road sync on the 2D GPS map and the 3D road network", status: "Implemented" },
        { name: "Community map corrections: players flag streets and submit coordinate and name fixes", status: "Implemented" },
        { name: "Procedural 3D landmarks with lore: Post Office Durbar statue, Challenge clocktower, Oja-Oba mosque, Fate roundabout, UNILORIN gate", status: "Implemented" },
        { name: "24-hour day/night cycle and sunny, cloudy and rainy weather that affects movement and vehicle handling", status: "Implemented" },
        { name: "Rain-only NPCs: umbrella vendors and Rain-Express Keke operators at the main gate, Tanke and Post Office", status: "Implemented" },
        { name: "Rigged 17-bone characters with 9 animations and 5 emotes", status: "Implemented" },
        { name: "Character creator: skin tones, hairstyles including braids and hijab, agbada, senator native and more", status: "Implemented" },
        { name: "AI NPC conversations with Gemini, aware of weather and location, with offline fallback lines", status: "Implemented" },
        { name: "5 drivable vehicles from bicycle to Korope bus, with AI traffic on campus and city corridors", status: "Implemented" },
        { name: "Naira economy: buka food, outfits, accessories and vehicles", status: "Implemented" },
        { name: "Mini-games: lecture quiz, library memory, penalty shootout, SUB arcade and side hustles", status: "Implemented" },
        { name: "7 guided GPS missions, from the Tanke–UNILORIN morning commute to the Stadium Cup", status: "Implemented" },
        { name: "Hostel builder: 4 accommodation tiers, grid furniture placement and hangout invites", status: "Implemented" },
        { name: "Real-time multiplayer: shared movement, driving and animations, campus chat and private messages", status: "Implemented" },
        { name: "BetaPhone: friends, gifting with daily caps, and a live Campus Feed with likes and comments", status: "Implemented" },
        { name: "Procedural campus radio: 5 stations synthesised live with Web Audio", status: "Implemented" },
        { name: "Study streaks and campus events with RSVP rewards", status: "Implemented" },
      ],
      architecture: [
        "React 19 + Vite UI with a Three.js world (procedural characters, vehicles and landmarks)",
        "Express API (OpenStreetMap sync, map corrections, NPC chat)",
        "ws WebSocket server (player sync, chat, feed, friends, gifts)",
        "Gemini for NPC dialogue · OpenStreetMap Overpass for roads",
      ],
      decisions: [
        {
          decision: "Build the world from real coordinates",
          alternatives: "A hand-drawn map loosely inspired by Ilorin",
          why: "Projecting real latitude and longitude onto the terrain means districts, landmarks and roads sit where players expect them, and live OpenStreetMap roads can be overlaid directly on the 3D world.",
          tradeOff: "Real geography is messy: roads and landmarks need validation, which is why players can submit map corrections.",
        },
        {
          decision: "Procedural characters, vehicles, landmarks and music",
          why: "Building meshes, skeletons, monuments and radio loops in code keeps the download small and makes Nigerian-specific content possible without a library of purchased 3D models and audio.",
          tradeOff: "Procedural assets take more engineering effort to look good than ready-made models.",
        },
        {
          decision: "AI NPC dialogue with an offline fallback",
          why: "NPCs answer free-form questions with Gemini, using the player's location and weather, but fall back to local campus-flavoured lines if the AI is unavailable, so conversations never break the game.",
        },
        {
          decision: "Daily caps on friend gifting",
          why: "Gifts are limited to 3 per day and ₦2,500 per day, which keeps the in-game economy from being drained or abused through transfers between accounts.",
        },
      ],
    },
  },
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
    featured: false,
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
    featured: false,
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
    slug: "zoomtrans",
    title: "ZoomTrans",
    description:
      "ZoomTrans is a smart transportation and digital mobility platform connecting passengers, drivers and transport administrators, starting at the University of Ilorin. It combines a React Native mobile app, a web admin interface, a Node.js backend and PostgreSQL, with digital wallet payments and QR-based interactions.",
    tags: ["React Native", "Expo", "Node.js", "PostgreSQL", "QR Payments"],
    category: "Mobility / Mobile & Web Platform",
    // Private repo, so no github link. No live link yet.
    status: "In progress",
    featured: false,
    video: "/projects/zoomtrans.mp4",
    caseStudy: {
      problem:
        "Transportation is part of everyday life in university communities, where students, staff and visitors depend on reliable mobility, yet getting a ride can still mean payment difficulties, limited coordination and inefficient processes. Inspired by discussions around student welfare and transportation at the University of Ilorin (UNILORIN), ZoomTrans asks what technology could do to make everyday transportation smarter, easier and more accessible. The first intended routes are Post Office–Hostel Area and Post Office–UITH.",
      role: "I lead ZoomTrans, a collaborative initiative with a team of five. We are building it as an integrated mobile and web ecosystem for three groups: passengers, who access transport through a convenient digital experience; drivers, who use the platform to support transport operations; and administrators, who manage and coordinate activity across the ecosystem.",
      architecture: [
        "React Native + Expo mobile app",
        "Web admin and operations interface",
        "Node.js API (backend-managed auth)",
        "PostgreSQL",
      ],
      challenges: [
        {
          title: "From a real-world problem to a practical product",
          detail:
            "Translating a transportation problem into software meant starting from genuine needs, not features, and shaping a solution people could use day to day.",
        },
        {
          title: "One connected ecosystem for different roles",
          detail:
            "Passengers, drivers and administrators each need their own experience, sharing data through API-driven communication between the apps and the backend.",
        },
        {
          title: "Constraints and real-world deployment",
          detail:
            "We have had to manage infrastructure and resource constraints while preparing the applications for real-world deployment.",
        },
      ],
      outcome:
        "Building ZoomTrans has taught us that useful technology starts with identifying genuine problems, and that good software needs more than functional code: thoughtful architecture, usability, security, collaboration and continuous improvement. It has strengthened our experience in full-stack development, API integration, database design, application architecture, teamwork and product development. ZoomTrans: move smarter, pay easier, travel better.",
      improvements: [
        "Physical ZoomTrans transit cards",
        "Contactless tap-in transportation payments",
        "Seamless wallet funding and payment experiences",
        "Improved driver and administrative workflows",
        "Intelligent transportation coordination and operational insights",
        "Expansion to other universities and urban transportation networks",
      ],
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
