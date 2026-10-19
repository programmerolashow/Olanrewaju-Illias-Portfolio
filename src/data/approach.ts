import { Bot, Gauge, Scale, ShieldCheck, type LucideIcon } from "lucide-react";

/**
 * Content for the "How I Work" page, in Olanrewaju's own words. These describe how he works, not
 * delivered results: keep outcomes, numbers and client claims out of here and put verified ones on
 * project pages.
 */

export const intro = {
  subtitle:
    "My approach to building software, solving technical problems, making engineering decisions, and collaborating with people.",
  paragraphs: [
    "I approach software engineering as a combination of problem-solving, product thinking, and technical execution. I aim to understand the problem before choosing a solution, build systems that are maintainable, validate important assumptions, and communicate decisions clearly.",
    "Whether I'm building a full-stack application, integrating AI into a product, modernizing an existing codebase, or collaborating with a team, I focus on delivering practical solutions without introducing unnecessary complexity.",
  ],
};

export interface Phase {
  title: string;
  steps: string[];
}

export const workflow: Phase[] = [
  {
    title: "Understand and Define",
    steps: [
      "Understand the problem and the people experiencing it.",
      "Gather requirements and clarify expected behaviour.",
      "Identify constraints, dependencies, and edge cases.",
      "Define acceptance criteria before implementation.",
      "Break large requirements into manageable tasks.",
    ],
  },
  {
    title: "Design and Plan",
    steps: [
      "Evaluate suitable technologies and implementation approaches.",
      "Design the necessary application architecture.",
      "Plan database schemas, API contracts, and component boundaries.",
      "Consider security, accessibility, performance, and maintainability.",
      "Identify technical risks and implementation trade-offs.",
    ],
  },
  {
    title: "Build and Validate",
    steps: [
      "Implement features in manageable increments.",
      "Follow existing project conventions where appropriate.",
      "Integrate frontend, backend, databases, and external services.",
      "Validate inputs and handle errors deliberately.",
      "Run relevant tests, linting, type checks, and builds.",
      "Review changes for regressions before delivery.",
    ],
  },
  {
    title: "Deliver and Improve",
    steps: [
      "Validate the completed functionality against requirements.",
      "Document important implementation decisions.",
      "Communicate limitations, blockers, and remaining work.",
      "Support deployment and integration where within scope.",
      "Use feedback and observed issues to guide improvements.",
    ],
  },
];

export const debugging = {
  intro:
    "My debugging approach is systematic. I try to establish what is happening, why it is happening, and how to verify that a fix addresses the underlying cause.",
  steps: [
    "Reproduce the issue consistently.",
    "Define the expected behaviour and compare it with the actual result.",
    "Gather evidence from error messages, logs, network requests, and application state.",
    "Narrow the problem to the relevant component, service, or integration.",
    "Form hypotheses about possible causes.",
    "Test those hypotheses individually.",
    "Identify the root cause rather than relying on a superficial workaround.",
    "Implement the smallest appropriate fix.",
    "Run relevant tests and check for regressions.",
    "Document the resolution and consider how to prevent similar issues.",
  ],
};

export const decisions = {
  intro:
    "I choose technologies and implementation approaches based on the problem being solved, rather than selecting tools simply because they are popular.",
  factors: [
    { label: "Requirements", question: "Does the solution satisfy the actual product needs?" },
    { label: "Maintainability", question: "Can the codebase be understood and changed over time?" },
    { label: "Reliability", question: "How will the system behave when something fails?" },
    { label: "Security", question: "What data, permissions, and trust boundaries need protection?" },
    { label: "Performance", question: "Will the approach meet realistic usage requirements?" },
    { label: "Complexity", question: "Is the additional abstraction or infrastructure justified?" },
    { label: "Integration", question: "How well does the solution fit the existing system?" },
    { label: "Cost", question: "What are the development, infrastructure, and ongoing operational costs?" },
    { label: "Team context", question: "Can the team implement and maintain the solution effectively?" },
    { label: "Trade-offs", question: "What advantages are gained, and what limitations are introduced?" },
  ],
  outro: "I prefer solutions that are sufficiently robust for the problem without making the system unnecessarily complicated.",
};

export const collaboration = {
  intro: "I value clear communication, shared ownership, and predictable engineering workflows.",
  points: [
    "Understanding the team's conventions and existing codebase.",
    "Breaking work into clear, manageable tasks.",
    "Communicating progress, blockers, and dependencies early.",
    "Using Git branches and merge requests to organize changes.",
    "Keeping changes focused and reviewable.",
    "Participating in code reviews and applying constructive feedback.",
    "Coordinating frontend, backend, and integration work.",
    "Documenting important technical decisions and handoffs.",
    "Validating changes before merging or deploying.",
    "Respecting ownership boundaries while contributing to shared goals.",
  ],
  outro:
    "I aim to make my work understandable to other developers and to leave the codebase easier to maintain wherever practical.",
};

export interface Pillar {
  icon: LucideIcon;
  title: string;
  points: string[];
}

export const aiPractices: Pillar[] = [
  {
    icon: Bot,
    title: "Design",
    points: [
      "Start with a clearly defined problem that benefits from AI.",
      "Determine whether AI is necessary or whether deterministic logic is more appropriate.",
      "Separate business rules from probabilistic model outputs.",
      "Design prompts and context around the task.",
      "Define expected output formats and validation requirements.",
      "Integrate AI services with application APIs and data carefully.",
      "Plan fallback behaviour for unavailable or unreliable model responses.",
    ],
  },
  {
    icon: Scale,
    title: "Evaluation",
    points: [
      "Define expected behaviour before testing.",
      "Test representative inputs and edge cases.",
      "Validate output structure and application-level correctness.",
      "Check how the system responds to incomplete or unexpected outputs.",
      "Evaluate consistency and task success against defined criteria.",
      "Record limitations and known failure modes.",
      "Avoid claiming reliability without appropriate evidence.",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Security",
    points: [
      "Treat user input and retrieved content as potentially untrusted.",
      "Consider prompt-injection risks.",
      "Validate model outputs before using them in sensitive workflows.",
      "Enforce authorization and permissions in application code.",
      "Avoid exposing secrets or unnecessary personal information.",
      "Apply appropriate rate limits and error handling.",
      "Keep high-impact decisions under explicit application controls.",
    ],
  },
  {
    icon: Gauge,
    title: "Cost and Performance",
    points: [
      "Choose models according to task requirements.",
      "Avoid unnecessary model calls.",
      "Manage prompt and context size.",
      "Handle timeouts and provider failures.",
      "Consider caching when appropriate.",
      "Measure latency and usage costs where possible.",
      "Balance response quality, cost, and user experience.",
      "Design graceful fallback behaviour when AI services are unavailable.",
    ],
  },
];

export const clients = {
  intro:
    "I approach client work by first understanding the desired outcome, clarifying the scope, and agreeing on what successful delivery means.",
  steps: [
    "Understand the client's problem and objectives.",
    "Clarify requirements, priorities, and constraints.",
    "Recommend an appropriate technical approach.",
    "Define deliverables and acceptance criteria.",
    "Break the work into manageable milestones.",
    "Communicate progress, risks, and changes.",
    "Implement and validate the agreed functionality.",
    "Provide relevant documentation and handover information.",
  ],
  outro:
    "I aim to maintain realistic expectations, explain technical trade-offs clearly, and focus on solutions that meet the client's actual needs.",
};

export const principles = [
  "Understand the problem before writing code.",
  "Build for real users and practical needs.",
  "Prefer clarity over unnecessary complexity.",
  "Make deliberate and explainable technical decisions.",
  "Treat security and privacy as engineering responsibilities.",
  "Validate assumptions and test important behaviour.",
  "Investigate root causes rather than hiding symptoms.",
  "Keep code maintainable and changes reviewable.",
  "Communicate clearly and collaborate respectfully.",
  "Treat AI outputs as requiring appropriate validation.",
  "Be honest about limitations, progress, and results.",
  "Learn continuously and improve through feedback.",
];
