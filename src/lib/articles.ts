import { useQuery } from "@tanstack/react-query";

/** Writing tracks, in display order. The /articles page adds icons and planned topics; the admin uses them as options. */
export const articleTracks = [
  { id: "full-stack", label: "Full-Stack Engineering" },
  { id: "ai", label: "AI Engineering" },
  { id: "database", label: "Database & Modernization" },
  { id: "quality", label: "Testing & Quality" },
  { id: "product", label: "Product Engineering" },
  { id: "fintech", label: "Fintech & Transactions" },
  { id: "devops", label: "DevOps & Collaboration" },
  { id: "case-studies", label: "Case Studies" },
] as const;

export type TrackId = (typeof articleTracks)[number]["id"];

/** Topics announced on /articles before they're written. Uploading an article for one turns it from Planned to Published. */
export const plannedTopics: Record<TrackId, string[]> = {
  "full-stack": [
    "Building Full-Stack Applications with React, Node.js, and PostgreSQL",
    "Designing Maintainable REST APIs for Modern Web Applications",
    "Connecting Frontend Applications to Backend Services",
    "Structuring TypeScript Projects for Long-Term Maintainability",
    "Common Full-Stack Development Challenges and How to Solve Them",
    "From Feature Requirements to Production-Ready Software",
    "Building Reusable UI Components Without Overcomplicating Your Architecture",
    "Debugging Frontend and Backend Integration Issues",
  ],
  ai: [
    "Integrating Large Language Models into Real-World Applications",
    "Prompt Engineering vs. Context Engineering: Understanding the Difference",
    "Combining Deterministic Business Rules with AI Reasoning",
    "Building AI-Powered Customer Support Workflows",
    "Designing More Reliable AI Application Workflows",
    "Handling AI Errors, Invalid Responses, and Unexpected Outputs",
    "Understanding Prompt Injection and Application-Level Defences",
    "Integrating OpenAI and Google Gemini APIs into Web Applications",
    "Moving Beyond AI Demos: Building Useful AI-Powered Products",
    "Lessons from Integrating AI into Existing Software Systems",
  ],
  database: [
    "Lessons from Migrating a JavaScript Codebase to TypeScript",
    "Moving from MySQL to PostgreSQL: Technical Considerations and Lessons",
    "Introducing Prisma into a Database-Backed Application",
    "Designing Database Schemas for Maintainable Applications",
    "Planning Safe and Repeatable Database Migrations",
    "Understanding ORM Trade-Offs in Modern Backend Development",
    "Troubleshooting Database Connectivity and Authentication Problems",
    "Maintaining Data Consistency During Application Modernization",
  ],
  quality: [
    "Debugging Software by Investigating Root Causes",
    "Why Type Checking and Linting Matter in Team Projects",
    "Building Reliable API Integration Tests",
    "Testing Authentication and Authorization Workflows",
    "Making Database Migrations Safer to Run Repeatedly",
    "Improving Code Quality Through Review and Refactoring",
    "Diagnosing Build Failures and CI/CD Pipeline Issues",
    "Turning Repeated Bugs into Better Engineering Practices",
  ],
  product: [
    "Building Software Around Real User Problems",
    "How to Turn an Idea into a Practical MVP",
    "Balancing Product Requirements with Engineering Constraints",
    "What I Learned from Leading a Student-Focused Technology Initiative",
    "Designing Technology Solutions for Transportation Challenges",
    "Lessons from Collaborating Across Engineering Teams",
    "Building Portfolio Projects That Demonstrate Engineering Ability",
    "Communicating Technical Decisions to Non-Technical Stakeholders",
    "From Product Concept to Technical Architecture",
    "Measuring Project Success Beyond Writing Code",
  ],
  fintech: [
    "Designing Reliable Transaction-Oriented Application Workflows",
    "Building Database-Backed Financial Operations",
    "Approaches to Transaction Matching and Discrepancy Detection",
    "Designing Audit Trails for Administrative Workflows",
    "Combining Business Rules, Data Validation, and AI in Financial Systems",
    "Lessons from Building Software for Business-Critical Workflows",
  ],
  devops: [
    "Setting Up CI/CD Pipelines for TypeScript Applications",
    "Organizing Git Branches and Merge Requests in Team Projects",
    "Automating Build, Lint, and Test Checks",
    "Managing Environment Variables Across Development and Deployment",
    "Troubleshooting Docker-Based Development Environments",
    "Improving Collaboration Through Better Technical Documentation",
  ],
  "case-studies": [
    "ZoomTrans: Turning a Transportation Problem into a Technology Initiative",
    "RefundOps: Combining Deterministic Refund Rules with AI Reasoning",
    "Database Modernization: Lessons from MySQL, PostgreSQL, and Prisma",
    "TypeScript Migration: Improving Type Safety in an Existing Codebase",
    "Building AI-Powered Features That Solve Practical Problems",
    "Lessons from Team Leadership and Collaborative Software Development",
    "Building and Maintaining Software Across Multiple Services",
    "What I Would Do Differently When Building My Next Product",
  ],
};

const normalise = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** The planned topic a title starts with, e.g. "Lessons from … TypeScript: Beyond …" → "Lessons from … TypeScript". */
export const matchPlannedTopic = (title: string): { track: TrackId; topic: string } | null => {
  const t = normalise(title);
  if (!t) return null;
  for (const track of articleTracks) {
    const topic = plannedTopics[track.id].find((p) => t.startsWith(normalise(p)));
    if (topic) return { track: track.id, topic };
  }
  return null;
};

export interface Article {
  id: string;
  title: string;
  summary: string;
  track: string;
  /** The planned topic this article fulfils (exact text from plannedTopics), or null for a new topic. */
  topic: string | null;
  /** Uploaded PDF or Word file. */
  fileUrl: string | null;
  /** Original file name, e.g. "typescript-migration.pdf". */
  fileName: string | null;
  scholarUrl: string | null;
  /** Zenodo record (zenodo.org) or its Zenodo DOI link. */
  zenodoUrl: string | null;
  /** YYYY-MM-DD */
  publishedOn: string | null;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ArticleInput = Omit<Article, "id" | "createdAt" | "updatedAt">;

/** "PDF", "Word" or null, from the stored file name (falling back to the URL). */
export const fileKind = (a: Pick<Article, "fileUrl" | "fileName">) => {
  const name = (a.fileName ?? a.fileUrl ?? "").toLowerCase();
  if (name.endsWith(".pdf")) return "PDF";
  if (name.endsWith(".docx")) return "Word";
  return a.fileUrl ? "File" : null;
};

/** "12 Oct 2026"; falls back to the upload date. */
export const articleDate = (a: Pick<Article, "publishedOn" | "createdAt">) =>
  new Date(`${a.publishedOn ?? a.createdAt.slice(0, 10)}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

/** Published articles for visitors, newest first. Fails quietly: the page falls back to the planned topics. */
export const useArticles = () =>
  useQuery({
    queryKey: ["articles"],
    queryFn: async (): Promise<Article[]> => {
      const res = await fetch("/api/articles");
      if (!res.ok) throw new Error(`Articles request failed (${res.status})`);
      return ((await res.json()) as { articles: Article[] }).articles;
    },
    staleTime: 60_000,
    retry: 1,
  });
