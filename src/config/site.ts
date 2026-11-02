/**
 * Site-wide settings. Imported by the app and by vite.config.ts (which fills index.html, writes
 * sitemap.xml and adds analytics at build time), so keep this file free of browser-only code.
 * Anything left empty switches its feature off.
 */
export const site = {
  /** Production origin, no trailing slash. Used for link previews (Open Graph) and the sitemap. */
  url: "https://olanrewaju-illias-portfolio.olanrewajuillias.workers.dev",
  name: "Olanrewaju Illias",
  title: "Olanrewaju Illias | Full-Stack Product Engineer",
  description:
    "Full-stack product engineer in Lagos, Nigeria, building web and mobile applications and AI-powered software with React, Next.js, TypeScript and PostgreSQL.",
  twitter: "@olanrewajuillias",
  /** Short availability line shown in the hero. Empty hides it. */
  availability: "Open to remote work",
  /** Umami Cloud website ID (Settings → Websites → Edit → Website ID). Empty turns analytics off. */
  umamiWebsiteId: "7d57fdd9-4984-4ecd-ab83-1610bed319a7",
  /** Scheduling link shown on the Contact section. Empty hides it. */
  bookingUrl: "https://calendly.com/olanrewajuillias/30min",
  /** Drop your CV in public/ and point this at it; the download buttons appear on the next build. */
  cvPath: "/ILLIAS_OLANREWAJU_CV.pdf",
  /** Google Scholar profile, linked from the Articles page and listed in the search-engine data. Empty hides the link. */
  scholarUrl: "https://scholar.google.com/citations?user=4lVtohYAAAAJ&hl=en",
};

/**
 * Who you are, for search engines (schema.org JSON-LD, written into every page at build time by vite.config.ts).
 * Google uses this for the name, job and profile links it shows about you. Only list things that are true today.
 */
export const person = {
  name: "Olanrewaju Illias",
  /** Other orders/spellings of your name people search for. */
  alternateNames: ["Illias Olanrewaju"],
  jobTitle: "Software Engineer",
  /** Path under public/ for your photo. */
  image: "/illias-hero.webp",
  employer: {
    name: "Core Technologies LTD",
    country: "NG",
    /** Products you work on there. Add a url to each once it has a public site. */
    products: [
      { name: "Qorelly", url: "" },
      { name: "Qore Catalog", url: "" },
      { name: "Qore Maps", url: "" },
    ],
  },
  /** Your profiles elsewhere; search engines use these to tie them to you. */
  sameAs: [
    "https://github.com/programmerolashow",
    "https://www.linkedin.com/in/olanrewaju-illias-993a982bb",
    "https://www.instagram.com/programmer_olashow",
    "https://x.com/olanrewajuillias",
  ],
};

/** Static routes for the sitemap; project pages are added from src/data/projects.ts. */
export const staticRoutes = ["/", "/services", "/projects", "/articles", "/moments", "/approach", "/updates", "/recommendations"];
