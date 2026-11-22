import { defineConfig, type HtmlTagDescriptor, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { person, site, staticRoutes } from "./src/config/site";
import { pageMeta, pageRoutes } from "./src/config/pages";
import { projects } from "./src/data/projects";
import { gallery } from "./src/data/gallery";
import { excerpt, replaceSeo, type SeoMeta } from "./api/_lib/seo.js";
import { apiDevServer } from "./scripts/vite-api-dev";

const escapeAttr = (value: string) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** Home-page link preview; also the fallback for any page without its own image. */
const defaultSeo = (): SeoMeta => ({
  siteName: site.name,
  twitter: site.twitter,
  title: site.title,
  description: site.description,
  url: `${site.url}/`,
  image: `${site.url}/og-image.jpg`,
  imageWidth: 1200,
  imageHeight: 630,
  imageAlt: `${site.name}, Full-Stack Product Engineer`,
});

/** schema.org Person + Organization (JSON-LD) from `person` in src/config/site.ts, for search engines. */
const structuredData = () => {
  const orgId = `${site.url}/#employer`;
  const graph = [
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: person.name,
      alternateName: person.alternateNames,
      jobTitle: person.jobTitle,
      description: site.description,
      url: `${site.url}/`,
      image: `${site.url}${person.image}`,
      worksFor: { "@id": orgId },
      sameAs: [site.scholarUrl, ...person.sameAs].filter(Boolean),
    },
    {
      "@type": "Organization",
      "@id": orgId,
      name: person.employer.name,
      address: { "@type": "PostalAddress", addressCountry: person.employer.country },
      brand: person.employer.products.map((p) => ({ "@type": "Brand", name: p.name, ...(p.url ? { url: p.url } : {}) })),
    },
    { "@type": "WebSite", "@id": `${site.url}/#website`, url: `${site.url}/`, name: site.name, author: { "@id": `${site.url}/#person` } },
  ];
  // "<" escaped so no value can close the <script> tag early.
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
};

/** Tags every page's <head> gets: search-engine data, the Updates feed link and (when set) Umami analytics. */
const headTags = (): HtmlTagDescriptor[] => [
  { tag: "script", attrs: { type: "application/ld+json" }, children: structuredData(), injectTo: "head" },
  // Lets feed readers find the Updates feed from any page (api/feed.js).
  {
    tag: "link",
    attrs: { rel: "alternate", type: "application/rss+xml", title: `${site.name}: Updates`, href: `${site.url}/api/feed` },
    injectTo: "head",
  },
  ...(site.umamiWebsiteId
    ? [
        {
          tag: "script",
          attrs: { defer: true, src: "https://cloud.umami.is/script.js", "data-website-id": site.umamiWebsiteId },
          injectTo: "head" as const,
        },
      ]
    : []),
];

/** Preview image URL with a content hash, so link-preview crawlers (they cache by URL) fetch a fresh copy when it changes. */
const versioned = (file: string) => {
  const full = path.join(__dirname, "public", file);
  if (!existsSync(full)) return undefined;
  const hash = createHash("sha1").update(readFileSync(full)).digest("hex").slice(0, 8);
  return `${site.url}${file}?v=${hash}`;
};
/** A screenshot of the page itself (npm run og:screens), when there is one. */
const screen = (name: string) => versioned(`/og/screens/${name}.jpg`);

/**
 * The new design (V2): static pages in public/ built from shared partials in v2/partials/. Each page has a classic
 * twin (public/design-switch.js pairs them) and the same link preview and canonical URL as that twin, since the
 * content is the same. Keys are the V2 route under /v2 ("" is the home page).
 */
const v2Pages = {
  "": { file: "v2.html", meta: undefined },
  services: { file: "v2/services.html", meta: "services" },
  moments: { file: "v2/moments.html", meta: "moments" },
  updates: { file: "v2/updates.html", meta: "updates" },
  recommendations: { file: "v2/recommendations.html", meta: "recommendations" },
} as const satisfies Record<string, { file: string; meta: keyof typeof pageMeta | undefined }>;
type V2Page = keyof typeof v2Pages;

const v2Seo = (page: V2Page): SeoMeta => {
  const key = v2Pages[page].meta;
  if (!key) return defaultSeo();
  const { title, description } = pageMeta[key];
  const image = screen(key);
  return {
    ...defaultSeo(),
    title: `${title} | ${site.name}`,
    description,
    url: `${site.url}${pageRoutes[key]}`,
    ...(image ? { image, imageAlt: `${title} page, ${site.name}` } : {}),
  };
};

/** Build-time data some V2 pages show when their API can't be reached (as the classic pages fall back). */
const v2Data = (name: string) => {
  if (name === "moments-fallback") return JSON.stringify(gallery).replace(/</g, "\\u003c");
  throw new Error(`Unknown V2 data block "${name}"`);
};

/**
 * Fills a V2 page: <!--v2:NAME--> becomes v2/partials/NAME.html, <!--v2-data:NAME--> a JSON block, {{home}} the
 * home page's path for links into its sections ("" on the home page itself, so they stay same-page anchors), then
 * the page's link-preview tags and headTags(). Used for the build (dist/) and by the dev server.
 */
const fillV2 = (html: string, page: V2Page) => {
  const withPartials = html
    .replace(/<!--v2:([a-z-]+)-->/g, (_, name: string) =>
      readFileSync(path.resolve(__dirname, "v2", "partials", `${name}.html`), "utf8").trimEnd(),
    )
    .replace(/<!--v2-data:([a-z-]+)-->/g, (_, name: string) => v2Data(name))
    .replace(/\{\{home\}\}/g, page === "" ? "" : "/v2");
  const tags = headTags()
    .map(({ tag, attrs = {}, children }) => {
      const a = Object.entries(attrs)
        .filter(([, v]) => v !== false && v !== undefined)
        .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${escapeAttr(String(v))}"`))
        .join("");
      return tag === "link" ? `<${tag}${a}>` : `<${tag}${a}>${typeof children === "string" ? children : ""}</${tag}>`;
    })
    .join("\n");
  return replaceSeo(withPartials, v2Seo(page)).replace("</head>", `${tags}\n</head>`);
};

/**
 * Fills index.html from src/config/site.ts (tokens + the home page's link-preview tags), adds the Umami script
 * when a website ID is set, writes sitemap.xml and robots.txt, and writes a copy of index.html for every fixed
 * page and project with that page's own title, description and preview image. Vercel serves those files
 * directly (cleanUrls in vercel.json), so LinkedIn, X, Facebook and WhatsApp (which don't run JavaScript) see the right preview.
 */
const sitePlugin = (): Plugin => ({
  name: "site-meta",
  transformIndexHtml: {
    // Run before Vite's own %ENV% replacement so it never sees the %SITE_NAME% token.
    order: "pre",
    handler(html) {
      const filled = replaceSeo(html, defaultSeo()).replace(/%SITE_NAME%/g, escapeAttr(site.name));
      return {
        html: filled,
        tags: headTags(),
      };
    },
  },
  generateBundle() {
    if (site.url.includes("REPLACE")) {
      this.warn("site.url in src/config/site.ts is still a placeholder: link previews and the sitemap will point nowhere.");
    }
    const routes = [...staticRoutes, ...projects.map((p) => `/projects/${p.slug}`)];
    const urls = routes.map((r) => `  <url><loc>${site.url}${r === "/" ? "/" : r}</loc></url>`).join("\n");
    this.emitFile({
      type: "asset",
      fileName: "sitemap.xml",
      source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    });
    this.emitFile({
      type: "asset",
      fileName: "robots.txt",
      source: `User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${site.url}/sitemap.xml\n`,
    });
  },
  writeBundle(options) {
    const outDir = options.dir ?? path.resolve(__dirname, "dist");
    // The new design's pages (copied from public/ as-is) get their partials and the same head as their classic twin.
    for (const [page, { file }] of Object.entries(v2Pages) as [V2Page, (typeof v2Pages)[V2Page]][]) {
      const out = path.join(outDir, file);
      if (existsSync(out)) writeFileSync(out, fillV2(readFileSync(out, "utf8"), page));
      else this.warn(`V2 page ${file} is missing from the build.`);
    }
    const template = readFileSync(path.join(outDir, "index.html"), "utf8");
    const base = defaultSeo();
    // Written as /services.html, /projects/bankspace.html, …; vercel.json's cleanUrls serves them at /services etc.
    const write = (route: string, meta: Partial<SeoMeta>) => {
      const file = path.join(outDir, `${route}.html`);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, replaceSeo(template, { ...base, url: `${site.url}${route}`, ...meta }));
    };


    for (const [key, route] of Object.entries(pageRoutes) as [keyof typeof pageMeta, string][]) {
      const { title, description } = pageMeta[key];
      const image = screen(key);
      if (!image) this.warn(`No page screenshot for "${route}"; using og-image.jpg. Run npm run og:screens.`);
      write(route, {
        title: `${title} | ${site.name}`,
        description,
        ...(image ? { image, imageAlt: `${title} page, ${site.name}` } : {}),
      });
    }
    for (const p of projects) {
      // Page screenshot first, then the generated card (npm run og:cards), then og-image.jpg.
      const image = screen(p.slug) ?? versioned(`/og/projects/${p.slug}.jpg`);
      if (!image) this.warn(`No preview image for project "${p.slug}"; using og-image.jpg. Run npm run og:screens.`);
      write(`/projects/${p.slug}`, {
        title: `${p.title} | ${site.name}`,
        description: excerpt(p.description),
        type: "article",
        ...(image ? { image, imageAlt: `${p.title}: ${p.tags.slice(0, 4).join(", ")}` } : {}),
      });
    }
  },
});

/**
 * The new design's pages are static files in public/ (see v2Pages). Cloudflare (html_handling), Vercel (cleanUrls)
 * and Netlify serve them at /v2, /v2/services, …; Vite's dev and preview servers don't, and their SPA fallback hands
 * those paths to the React app (its 404 page). Locally they're served from the .html files: in dev filled in on the
 * fly (fillV2), in preview from dist/ where the build already filled them.
 */
const v2PagesServer = (): Plugin => {
  const match = (url?: string): { page: V2Page; query: string } | null => {
    const m = url?.match(/^\/v2(?:\/([a-z-]*?))?(?:\.html)?\/?(\?.*)?$/);
    if (!m) return null;
    const page = (m[1] ?? "") as V2Page;
    return page in v2Pages ? { page, query: m[2] ?? "" } : null;
  };
  return {
    name: "v2-pages",
    configureServer: (server) =>
      void server.middlewares.use((req, res, next) => {
        const m = match(req.url);
        if (!m) return next();
        const html = readFileSync(path.resolve(__dirname, "public", v2Pages[m.page].file), "utf8");
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(fillV2(html, m.page));
      }),
    configurePreviewServer: (server) =>
      void server.middlewares.use((req, _res, next) => {
        const m = match(req.url);
        if (m) req.url = `/${v2Pages[m.page].file}${m.query}`;
        next();
      }),
  };
};

// https://vitejs.dev/config/
export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    // In development, /api/updates and /api/admin/* run from api/ (see scripts/vite-api-dev.ts); the rest of
    // /api/* (the contact form) goes to the Express server in /backend (run: cd backend && npm run dev).
    // In production on Vercel, everything under /api is served from api/.
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
  define: {
    __HAS_CV__: JSON.stringify(existsSync(path.resolve(__dirname, "public", site.cvPath.replace(/^\//, "")))),
  },
  plugins: [v2PagesServer(), react(), sitePlugin(), apiDevServer(__dirname)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // The single vendor chunk below is ~530 kB (~170 kB gzipped); that's expected.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // One long-lived vendor chunk: it changes rarely, so returning visitors keep it cached.
        // Keep it as ONE chunk. Splitting React from libraries that use it (e.g. separate "react" and "vendor"
        // chunks) created a circular import that ran a library before React existed and blanked the whole site.
        manualChunks(id) {
          if (id.includes("node_modules")) return "vendor";
        },
      },
    },
  },
}));
