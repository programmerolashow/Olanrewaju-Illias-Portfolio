import { Bot, Gauge, Scale, ShieldCheck, type LucideIcon } from "lucide-react";

/**
 * Content for the "How I Work" page. These describe how Olanrewaju works, not delivered results:
 * keep outcomes, numbers and client claims out of here and put verified ones on project pages.
 */

export interface Phase {
  title: string;
  steps: string[];
}

/** Development workflow, grouped into phases so 13 steps read as a journey rather than a wall. */
export const workflow: Phase[] = [
  { title: "Understand", steps: ["Understand the problem", "Gather requirements", "Define acceptance criteria"] },
  { title: "Plan", steps: ["Evaluate technical options", "Plan the architecture", "Design database schemas and APIs", "Break work into manageable tasks"] },
  { title: "Build", steps: ["Implement features", "Test and debug", "Review code"] },
  { title: "Ship", steps: ["Prepare deployments", "Validate completed functionality", "Document decisions and lessons learned"] },
];

export const debugging = [
  { title: "Reproduce the issue", detail: "Confirm the exact steps, inputs and environment that trigger it." },
  { title: "Gather evidence", detail: "Logs, error traces, network requests and recent changes." },
  { title: "List possible causes", detail: "Write down hypotheses instead of guessing at fixes." },
  { title: "Isolate the root cause", detail: "Narrow it down until one cause explains every symptom." },
  { title: "Evaluate fixes", detail: "Compare options by risk, scope and side effects." },
  { title: "Make the smallest appropriate change", detail: "Fix the cause, not the symptom, without touching unrelated code." },
  { title: "Test the solution", detail: "Prove the original issue is gone." },
  { title: "Check for regressions", detail: "Make sure nothing nearby broke." },
  { title: "Document the outcome", detail: "Record what happened and why the fix works." },
  { title: "Prevent recurrence", detail: "Add a test, a constraint or a check so it can't quietly return." },
];

export const decisionFactors = [
  "Technology selection",
  "Architecture trade-offs",
  "Database technology",
  "Build versus buy",
  "Maintainability",
  "Performance and scalability",
  "Security implications",
  "Development cost and complexity",
  "Short-term versus long-term trade-offs",
];

export const collaboration = [
  "Working within existing codebases and their conventions",
  "Branch-based development with merge requests and code review",
  "Communicating blockers early",
  "Coordinating frontend and backend changes",
  "Receiving and applying feedback",
  "Documenting handoffs",
  "Validating changes before merging",
  "Coordinating deployment and release activities",
];

export interface Pillar {
  icon: LucideIcon;
  title: string;
  points: string[];
}

/** Practices, not service claims: phrased as how AI features should be built. */
export const aiPractices: Pillar[] = [
  {
    icon: Bot,
    title: "System design",
    points: [
      "Decide first whether AI is the right tool for the feature",
      "Keep business rules separate from probabilistic model output",
      "Use structured prompts and defined response formats",
      "Manage context and conversation history deliberately",
      "Validate model output and handle invalid or incomplete responses",
      "Design fallback behaviour",
    ],
  },
  {
    icon: Scale,
    title: "Evaluation and reliability",
    points: [
      "Write representative test cases, including edge cases",
      "Test expected and unexpected outputs for consistency",
      "Measure task success against defined criteria",
      "Identify hallucination risks",
      "Handle model and provider errors",
      "Record limitations and known failure modes",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Security and privacy",
    points: [
      "Threat-model prompt injection",
      "Separate untrusted content from trusted instructions",
      "Enforce authorization outside model-generated decisions",
      "Never expose secrets to models",
      "Minimise personal data and protect sensitive context",
      "Apply rate limits and test unsafe inputs",
    ],
  },
  {
    icon: Gauge,
    title: "Cost and performance",
    points: [
      "Weigh model choice against quality, latency and cost",
      "Cut unnecessary API calls and manage context size",
      "Cache where appropriate",
      "Handle timeouts and retries",
      "Track usage limits",
      "Degrade gracefully when a provider is unavailable",
    ],
  },
];

export const engagement = [
  { title: "Discuss", detail: "An initial conversation to understand the problem you're solving." },
  { title: "Define scope", detail: "Objectives, deliverables, assumptions, integrations and acceptance criteria, agreed in writing." },
  { title: "Check feasibility", detail: "A technical review of constraints and dependencies before committing to milestones." },
  { title: "Plan milestones", detail: "Work broken into deliverable milestones you can see and test." },
  { title: "Build and demo", detail: "Regular progress updates and demos, with risks and blockers raised early." },
  { title: "Revise", detail: "Feedback rounds, with change requests handled openly against the agreed scope." },
  { title: "Hand over", detail: "Documentation and a clean handover, plus agreed maintenance arrangements." },
];

export const principles = [
  "Build solutions around real problems.",
  "Prefer maintainable implementations over unnecessary complexity.",
  "Explain technical decisions clearly.",
  "Prioritise reliability and data integrity.",
  "Treat AI output as something to validate, not automatically trust.",
  "Protect confidential information.",
  "Distinguish individual contributions from team achievements.",
  "Be honest about project status and limitations.",
  "Measure results rather than inventing metrics.",
  "Learn from technical challenges.",
  "Communicate clearly with teammates and stakeholders.",
  "Keep projects accessible, usable and maintainable.",
];
