import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { createHash } from "crypto";
import { person, site, staticRoutes } from "./src/config/site";
import { pageMeta, pageRoutes } from "./src/config/pages";
import { projects } from "./src/data/projects";
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
        tags: [
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
        ],
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
    const template = readFileSync(path.join(outDir, "index.html"), "utf8");
    const base = defaultSeo();
    // Written as /services.html, /projects/bankspace.html, …; vercel.json's cleanUrls serves them at /services etc.
    const write = (route: string, meta: Partial<SeoMeta>) => {
      const file = path.join(outDir, `${route}.html`);
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, replaceSeo(template, { ...base, url: `${site.url}${route}`, ...meta }));
    };

    // Preview image URL with a content hash, so WhatsApp, LinkedIn, X and Facebook fetch a fresh copy whenever the
    // image changes (they cache images by URL).
    const versioned = (file: string) => {
      const full = path.join(__dirname, "public", file);
      if (!existsSync(full)) return undefined;
      const hash = createHash("sha1").update(readFileSync(full)).digest("hex").slice(0, 8);
      return `${site.url}${file}?v=${hash}`;
    };
    // A screenshot of the page itself (npm run og:screens), when there is one.
    const screen = (name: string) => versioned(`/og/screens/${name}.jpg`);

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
 * The new home page design is a static page, public/v2.html. Cloudflare (html_handling), Vercel (cleanUrls) and
 * Netlify serve it at /v2; Vite's dev and preview servers don't, and their SPA fallback hands /v2 to the React app
 * (its 404 page). This maps /v2 and /v2/ to /v2.html locally, keeping the query string.
 */
const v2Page = (): Plugin => {
  const rewrite = (req: { url?: string }, _res: unknown, next: () => void) => {
    const match = req.url?.match(/^\/v2\/?(\?.*)?$/);
    if (match) req.url = `/v2.html${match[1] ?? ""}`;
    next();
  };
  return {
    name: "v2-page",
    configureServer: (server) => void server.middlewares.use(rewrite),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite),
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
  plugins: [v2Page(), react(), sitePlugin(), apiDevServer(__dirname)],
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
