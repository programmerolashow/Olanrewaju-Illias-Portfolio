/**
 * Site-wide settings. Imported by the app and by vite.config.ts (which fills index.html, writes
 * sitemap.xml and adds analytics at build time), so keep this file free of browser-only code.
 * Anything left empty switches its feature off.
 */
export const site = {
  /** Production origin, no trailing slash. Used for link previews (Open Graph) and the sitemap. */
  url: "https://olanrewaju-illias-portfolio.vercel.app",
  name: "Olanrewaju Illias",
  title: "Olanrewaju Illias | Full-Stack Product Engineer",
  description:
    "Full-stack product engineer in Lagos, Nigeria, building web and mobile applications and AI-powered software with React, Next.js, TypeScript and PostgreSQL.",
  twitter: "@olanrewajuillias",
  /** Short availability line shown in the hero. Empty hides it. */
  availability: "Open to remote work",
  /** Umami Cloud website ID (Settings → Websites → Edit → Website ID). Empty turns analytics off. */
  umamiWebsiteId: "7d57fdd9-4984-4ecd-ab83-1610bed319a7",
  /** Drop your CV at public/cv.pdf and the download buttons appear on the next build. */
  cvPath: "/ILLIAS_OLANREWAJU_CV.docx",
};

/** Static routes for the sitemap; project pages are added from src/data/projects.ts. */
export const staticRoutes = ["/", "/services", "/projects", "/articles", "/moments", "/approach"];
