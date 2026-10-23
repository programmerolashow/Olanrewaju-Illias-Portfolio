/**
 * Title and description for each fixed page. Used by the page itself (tab title) and by the build, which writes
 * these into each page's HTML so shared links preview correctly on LinkedIn, X, Facebook and WhatsApp.
 * Keep this file free of browser-only code: vite.config.ts imports it.
 */
export interface PageMeta {
  title: string;
  description: string;
}

export const pageMeta = {
  services: {
    title: "Services",
    description: "Full-stack, AI integration, API, database, fintech, QA, DevOps and documentation services by Olanrewaju Illias.",
  },
  projects: {
    title: "Projects",
    description: "Featured and noteworthy projects by Olanrewaju Illias, with live demos and source code.",
  },
  articles: {
    title: "Articles",
    description: "Technical articles and project lessons by Olanrewaju Illias on full-stack, AI, databases and more.",
  },
  moments: {
    title: "Moments",
    description: "Events, talks, community meetups and the people Olanrewaju Illias builds with.",
  },
  approach: {
    title: "How I Work",
    description:
      "My approach to building software, solving technical problems, making engineering decisions, and collaborating with people.",
  },
  updates: {
    title: "Updates",
    description: "Events Olanrewaju Illias is attending or speaking at, and his latest posts.",
  },
  recommendations: {
    title: "Recommendations",
    description: "What colleagues, managers, classmates and collaborators say about working with Olanrewaju Illias.",
  },
} satisfies Record<string, PageMeta>;

/** Route for each entry above. */
export const pageRoutes: Record<keyof typeof pageMeta, string> = {
  services: "/services",
  projects: "/projects",
  articles: "/articles",
  moments: "/moments",
  approach: "/approach",
  updates: "/updates",
  recommendations: "/recommendations",
};
