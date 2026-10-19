export interface CaseStudy {
  /** What problem the project solves, and for whom. */
  problem?: string;
  /** What you personally did on it. */
  role?: string;
  /** What was hard and how you solved it. */
  challenges?: string[];
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
  /** What you'd do differently or next. */
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
      "BankSpace is a full-stack fintech platform designed to provide users with a modern digital banking experience. It includes secure authentication, KYC onboarding, financial dashboards, savings and investment features, budget management, transfers, and transaction tracking, with integrated services supporting real-world payment workflows.",
    tags: ["Next.js", "TypeScript", "PostgreSQL", "Prisma", "Neon", "Paystack"],
    github: "https://github.com/programmerolashow/BankSpace",
    live: "https://bank-space-mu95.vercel.app/",
    featured: true,
    image: "/projects/bankspace.webp",
    imageFocus: "80% center",
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
